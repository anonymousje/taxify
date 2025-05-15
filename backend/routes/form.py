from fastapi.responses import FileResponse
from scripts.pdfFiller import fill_tax_form_image, calculate_tax, generate_pdf_from_images
from sqlalchemy import func
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.income_model import Income
from models.expense_model import Expense
from jwt_handler import get_current_user
from models.user import User

router = APIRouter()


@router.get("/generate_tax_forms", response_class=FileResponse)
def generate_tax_forms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    salary_income = db.query(
        func.coalesce(func.sum(Income.total), 0)
    ).filter(
        Income.user_id == current_user.id,
        Income.income_category == "Salary"
    ).scalar()

    expenses = (
        db.query(
            Expense.expense_category,
            func.sum(Expense.total).label("total_expense")
        )
        .filter(Expense.user_id == current_user.id)
        .group_by(Expense.expense_category)
        .all()
    )

    normalization_map = {
        "Rent": "Rent",
        "Rates / Taxes / Charge / Cess": "Tax",
        "Vehicle Running / Maintenance": "Maintenance",
        "Travelling": "Traveling",
        "Electricity": "Electricity",
        "Water": "Water",
        "Gas": "Gas",
        "Telephone": "Telephone",
        "Asset Insurance / Security": "Insurance",
        "Medical": "Medical",
        "Educational": "Educational",
        "Club": "Club",
        "Functions / Gatherings": "Functions",
        "Donation, Zakat, Annuity, Profit on Debt, Life Insurance Premium, etc.": "Donation",
        "Other Personal / Household Expenses": "Household",
        "Contribution in Expenses by Family Members": "Contribution"
    }

    categories = list(normalization_map.values())
    data = {'Salary': int(salary_income), **{cat: 0 for cat in categories}}

    for raw_cat, total in expenses:
        normalized = normalization_map.get(raw_cat)
        if normalized:
            data[normalized] += int(total)

    total_expenses = sum(data[cat] for cat in categories)
    data['Remainder'] = int(data['Salary'] - total_expenses)

    # 1. Fill images
    fill_tax_form_image(data)

    # 2. Merge into PDF
    pdf_path = generate_pdf_from_images()

    # 3. Return PDF as file response
    return FileResponse(pdf_path, filename="filled_tax_form.pdf", media_type='application/pdf')
