import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_communication_crud_lifecycle(client):
    # create property, unit, and tenant
    prop_res = client.post('/api/v1/property', json={"name": "Temp Comm Prop"})
    property_id = prop_res.json["id"]
    
    unit_res = client.post('/api/v1/unit', json={"unitName": "C-101", "propertyId": property_id})
    unit_id = unit_res.json["id"]

    tenant_res = client.post('/api/v1/tenant', json={"firstName": "Jane", "lastName": "Smith", "unitID": unit_id})
    tenant_id = tenant_res.json["id"]

    # create the communication
    comm_data = {
        "tenantID": tenant_id,
        "title": "Rent Reminder",
        "body": "Please remember rent is due on the 1st."
    }
    post_res = client.post('/api/v1/communication', json=comm_data)
    assert post_res.status_code == 201
    comm_id = post_res.json["id"]

    # read the communication
    get_res = client.get(f'/api/v1/communication/{comm_id}')
    assert get_res.status_code == 200
    assert get_res.json["title"] == "Rent Reminder"

    # update the communication
    comm_data["body"] = "Rent is due on the 1st. Thank you!"
    put_res = client.put(f'/api/v1/communication/{comm_id}', json=comm_data)
    assert put_res.status_code == 200

    # remove the communication
    del_res = client.delete(f'/api/v1/communication/{comm_id}')
    assert del_res.status_code == 200

    # this automatically deletes the test unit, tenant, and any leftover communication
    client.delete(f'/api/v1/property/{property_id}')