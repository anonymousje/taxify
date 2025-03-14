import torch
from collections import Counter
from transformers import AutoModelForTokenClassification, AutoProcessor
from PIL import Image


class ReceiptReader:
    def __init__(self, path_to_model="model"):
        self.model = AutoModelForTokenClassification.from_pretrained(
            path_to_model)
        self.model.eval()
        self.processor = AutoProcessor.from_pretrained(path_to_model)

    def __call__(self, image):
        encodings = self.__get_encodings(image)
        words = self.__get_words(encodings)
        bboxes = encodings.bbox[0]
        logits = self.model(**encodings).logits
        predictions = torch.argmax(logits, dim=2)
        labeled_tokens = [self.model.config.id2label[t.item()]
                          for t in predictions[0]]
        response_dict = self.__merge_tokens(words, bboxes, labeled_tokens)
        response_dict["bboxes"] = [self.__unnormalize_bbox(
            bbox, image) for bbox in response_dict["bboxes"]]
        return response_dict

    def __get_encodings(self, image):
        return self.processor(image, return_tensors="pt")

    def __get_words(self, encodings):
        words = [self.processor.tokenizer.decode(
            input_id) for input_id in encodings.input_ids[0]]
        return words

    def __merge_tokens(self, words, bboxes, labels):
        new_words = []
        new_bboxes = []
        new_labels = []
        i = 0
        while i < len(words):
            token, bbox, label = words[i], bboxes[i], labels[i]
            j = i + 1
            while j < len(words) and self.__is_same_bbox(bbox, bboxes[j]):
                token += words[j]
                j += 1
            counter = Counter([labels[k] for k in range(i, j)])
            sorted_labels = sorted(counter, key=counter.get, reverse=True)
            label = sorted_labels[1] if sorted_labels[0] == "O" and len(
                sorted_labels) > 1 else sorted_labels[0]
            new_words.append(token)
            new_bboxes.append(bbox)
            new_labels.append(label)
            i = j
        return {"words": new_words, "bboxes": new_bboxes, "labels": new_labels}

    def __is_same_bbox(self, bbox1, bbox2):
        return all(abs(bbox1[i] - bbox2[i]) <= 3 for i in range(4))

    def __unnormalize_bbox(self, bbox, image):
        width, height = image.size
        return [bbox[0] * width / 1000, bbox[1] * height / 1000, bbox[2] * width / 1000, bbox[3] * height / 1000]


class ReceiptInformationExtractor:
    def __init__(self, path_to_model="model"):
        self.receipt_reader = ReceiptReader(path_to_model)

    def __call__(self, image):
        receipt_data = self.receipt_reader(image)
        response_dict = {"company": "", "date": "",
                         "address": "", "total": "", "tax": ""}

        # Extract company
        max_bbox = 0
        for word, bbox, label in zip(receipt_data['words'], receipt_data["bboxes"], receipt_data["labels"]):
            if label == "B-COMPANY" and (bbox_size := (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])) > max_bbox:
                response_dict["company"], max_bbox = word.strip(), bbox_size

        # Extract address
        max_bbox = 0
        for word, bbox, label in zip(receipt_data['words'], receipt_data["bboxes"], receipt_data["labels"]):
            if label == "B-ADDRESS" and (bbox_size := (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])) > max_bbox:
                response_dict["address"], max_bbox = word.strip(), bbox_size

        # Extract date
        min_y = float("inf")
        for word, bbox, label in zip(receipt_data['words'], receipt_data["bboxes"], receipt_data["labels"]):
            if label == "B-DATE" and bbox[1] < min_y:
                response_dict["date"], min_y = word.strip(), bbox[1]

        # Extract total
        max_y = 0
        for word, bbox, label in zip(receipt_data['words'], receipt_data["bboxes"], receipt_data["labels"]):
            if label == "B-TOTAL" and bbox[3] > max_y:
                response_dict["total"], max_y = word.strip(), bbox[3]

        # Extract tax
        max_bbox = 0
        for word, bbox, label in zip(receipt_data['words'], receipt_data["bboxes"], receipt_data["labels"]):
            if label == "B-TAX" and (bbox_size := (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])) > max_bbox:
                response_dict["tax"], max_bbox = word.strip(), bbox_size

        return response_dict
