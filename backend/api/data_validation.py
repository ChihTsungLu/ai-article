# main.py
from fastapi import FastAPI, HTTPException, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Callable
from abc import ABC, abstractmethod
router = APIRouter()
app = FastAPI()


# Models
class Address(BaseModel):
    city: str
    district: str
    street: str

class OrderInput(BaseModel):
    id: str
    name: str
    address: Address
    price: str
    currency: str

class OrderOutput(BaseModel):
    id: str
    name: str
    address: Address
    price: float
    currency: str

# Validation Strategy
class ValidationStrategy(ABC):
    @abstractmethod
    def validate(self, value: str) -> bool:
        pass

class NameValidationStrategy(ValidationStrategy):
    def validate(self, value: str) -> bool:
        import re
        return bool(re.match(r'^[A-Za-z\s\']+$', value))

class CapitalizedNameValidationStrategy(ValidationStrategy):
    def validate(self, value: str) -> bool:
        return value.istitle()

class PriceValidationStrategy(ValidationStrategy):
    def validate(self, value: str) -> bool:
        try:
            return float(value) <= 2000
        except ValueError:
            return False

class CurrencyValidationStrategy(ValidationStrategy):
    def validate(self, value: str) -> bool:
        return value in ["TWD", "USD"]

# Validator
class Validator:
    def __init__(self, strategies: Dict[str, ValidationStrategy]):
        self.strategies = strategies

    def validate(self, field: str, value: str) -> bool:
        if field not in self.strategies:
            raise ValueError(f"No validation strategy for field: {field}")
        return self.strategies[field].validate(value)

# Currency Transformation Command
class CurrencyTransformCommand(ABC):
    @abstractmethod
    def execute(self, price: float) -> tuple[float, str]:
        pass

class USDToTWDCommand(CurrencyTransformCommand):
    def execute(self, price: float) -> tuple[float, str]:
        return price * 31, "TWD"

class TWDToTWDCommand(CurrencyTransformCommand):
    def execute(self, price: float) -> tuple[float, str]:
        return price, "TWD"

# Currency Transformer
class CurrencyTransformer:
    def __init__(self, commands: Dict[str, CurrencyTransformCommand]):
        self.commands = commands

    def transform(self, price: float, currency: str) -> tuple[float, str]:
        if currency not in self.commands:
            raise ValueError(f"No transformation command for currency: {currency}")
        return self.commands[currency].execute(price)

# Order Service
class OrderService:
    def __init__(self, validator: Validator, transformer: CurrencyTransformer):
        self.validator = validator
        self.transformer = transformer

    def create_order(self, order: OrderInput) -> OrderOutput:
        self._validate_order(order)
        price, currency = self.transformer.transform(float(order.price), order.currency)
        return OrderOutput(
            id=order.id,
            name=order.name,
            address=order.address,
            price=price,
            currency=currency
        )

    def _validate_order(self, order: OrderInput):
        validations = [
            ("name", order.name, "Name contains non-English characters"),
            ("capitalizedName", order.name, "Name is not capitalized"),
            ("price", order.price, "Price is over 2000"),
            ("currency", order.currency, "Currency format is wrong")
        ]
        for field, value, error_message in validations:
            if not self.validator.validate(field, value):
                raise HTTPException(status_code=400, detail=error_message)

# Dependency Injection
def get_order_service():
    validator = Validator({
        "name": NameValidationStrategy(),
        "capitalizedName": CapitalizedNameValidationStrategy(),
        "price": PriceValidationStrategy(),
        "currency": CurrencyValidationStrategy()
    })
    transformer = CurrencyTransformer({
        "USD": USDToTWDCommand(),
        "TWD": TWDToTWDCommand()
    })
    return OrderService(validator, transformer)

# API Route
@router.post("/api/orders", response_model=OrderOutput)
async def create_order(order: OrderInput, order_service: OrderService = Depends(get_order_service)):
    return order_service.create_order(order)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)