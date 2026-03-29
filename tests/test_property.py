import pytest
from app import app



def test_get_all_property(client):
    """Test GET /api/v1/property"""
    response = client.get('/api/v1/property')
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_property_crud_lifecycle(client):
    """Test POST, GET, PUT, and DELETE."""
    
    # create a new property
    new_property_data = {
        "name": "Test Automation Building",
        "address": "999 Testing Ave"
    }
    # use json to automatically set headers
    post_response = client.post('/api/v1/property', json=new_property_data)
    
    assert post_response.status_code == 201
    assert "id" in post_response.json
    assert post_response.json["message"] == "Property created"
    
    # save the id for the next steps
    property_id = post_response.json["id"]

    # read the specific property
    get_response = client.get(f'/api/v1/property/{property_id}')
    
    assert get_response.status_code == 200
    assert get_response.json["name"] == "Test Automation Building"
    assert get_response.json["address"] == "999 Testing Ave"

    # update the property
    update_data = {
        "name": "Test Automation Building - UPDATED",
        "address": "888 New Address Blvd"
    }
    put_response = client.put(f'/api/v1/property/{property_id}', json=update_data)
    
    assert put_response.status_code == 200
    assert put_response.json["message"] == "Property updated successfully"

    # fetch all to verify the update is saved in the db
    verify_update = client.get(f'/api/v1/property/{property_id}')
    assert verify_update.json["name"] == "Test Automation Building - UPDATED"

    # remove the property
    delete_response = client.delete(f'/api/v1/property/{property_id}')
    
    assert delete_response.status_code == 200
    assert delete_response.json["message"] == "Property deleted successfully"

    # verify delete
    verify_delete = client.get(f'/api/v1/property/{property_id}')
    assert verify_delete.status_code == 404