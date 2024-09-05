
from fastapi.testclient import TestClient
from api.data_validation import (
    NameValidationStrategy, 
    CapitalizedNameValidationStrategy, 
    PriceValidationStrategy, 
    CurrencyValidationStrategy,
    USDToTWDCommand,
    TWDToTWDCommand
)
from main import app


client = TestClient(app)

# Test Validation Strategies
def test_name_validation_strategy():
    strategy = NameValidationStrategy()
    assert strategy.validate("John Doe") == True
    assert strategy.validate("John O'Brien") == True
    assert strategy.validate("John123") == False
    assert strategy.validate("John@Doe") == False

def test_capitalized_name_validation_strategy():
    strategy = CapitalizedNameValidationStrategy()
    assert strategy.validate("John Doe") == True
    assert strategy.validate("john Doe") == False
    assert strategy.validate("JOHN DOE") == False

def test_price_validation_strategy():
    strategy = PriceValidationStrategy()
    assert strategy.validate("1000") == True
    assert strategy.validate("2000") == True
    assert strategy.validate("2001") == False
    assert strategy.validate("abc") == False

def test_currency_validation_strategy():
    strategy = CurrencyValidationStrategy()
    assert strategy.validate("TWD") == True
    assert strategy.validate("USD") == True
    assert strategy.validate("EUR") == False

# Test Currency Transform Commands
def test_usd_to_twd_command():
    command = USDToTWDCommand()
    assert command.execute(100) == (3100, "TWD")

def test_twd_to_twd_command():
    command = TWDToTWDCommand()
    assert command.execute(100) == (100, "TWD")

# Test API endpoint
def test_create_order_success():
    order_data = {
        "id": "123",
        "name": "John Doe",
        "address": {
            "city": "Taipei",
            "district": "Xinyi",
            "street": "Main St"
        },
        "price": "1000",
        "currency": "TWD"
    }
    response = client.post("/api/orders", json=order_data)
    assert response.status_code == 200
    assert response.json() == {
        "id": "123",
        "name": "John Doe",
        "address": {
            "city": "Taipei",
            "district": "Xinyi",
            "street": "Main St"
        },
        "price": 1000,
        "currency": "TWD"
    }

def test_create_order_usd_currency():
    order_data = {
        "id": "124",
        "name": "Jane Doe",
        "address": {
            "city": "New York",
            "district": "Manhattan",
            "street": "Broadway"
        },
        "price": "100",
        "currency": "USD"
    }
    response = client.post("/api/orders", json=order_data)
    assert response.status_code == 200
    assert response.json() == {
        "id": "124",
        "name": "Jane Doe",
        "address": {
            "city": "New York",
            "district": "Manhattan",
            "street": "Broadway"
        },
        "price": 3100,
        "currency": "TWD"
    }

def test_create_order_invalid_name():
    order_data = {
        "id": "125",
        "name": "John123",
        "address": {
            "city": "Taipei",
            "district": "Xinyi",
            "street": "Main St"
        },
        "price": "1000",
        "currency": "TWD"
    }
    response = client.post("/api/orders", json=order_data)
    assert response.status_code == 400
    assert response.json() == {"detail": "Name contains non-English characters"}

def test_create_order_uncapitalized_name():
    order_data = {
        "id": "126",
        "name": "john Doe",
        "address": {
            "city": "Taipei",
            "district": "Xinyi",
            "street": "Main St"
        },
        "price": "1000",
        "currency": "TWD"
    }
    response = client.post("/api/orders", json=order_data)
    assert response.status_code == 400
    assert response.json() == {"detail": "Name is not capitalized"}

def test_create_order_invalid_price():
    order_data = {
        "id": "127",
        "name": "John Doe",
        "address": {
            "city": "Taipei",
            "district": "Xinyi",
            "street": "Main St"
        },
        "price": "2001",
        "currency": "TWD"
    }
    response = client.post("/api/orders", json=order_data)
    assert response.status_code == 400
    assert response.json() == {"detail": "Price is over 2000"}

def test_create_order_invalid_currency():
    order_data = {
        "id": "128",
        "name": "John Doe",
        "address": {
            "city": "Taipei",
            "district": "Xinyi",
            "street": "Main St"
        },
        "price": "1000",
        "currency": "EUR"
    }
    response = client.post("/api/orders", json=order_data)
    assert response.status_code == 400
    assert response.json() == {"detail": "Currency format is wrong"}