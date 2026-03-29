import pytest
from app import app



def test_tenant_crud_lifecycle(client):
    # create property and unit
    prop_res = client.post('/api/v1/property', json={"name": "Temp Tenant Prop"})
    property_id = prop_res.json["id"]
    
    unit_res = client.post('/api/v1/unit', json={"unitName": "T-101", "propertyId": property_id})
    unit_id = unit_res.json["id"]

    # 2. create the tenant
    tenant_data = {
        "firstName": "John",
        "lastName": "Doe",
        "phoneNumber": "555-0199",
        "unitID": unit_id,
        "leaseStartDate": "2026-03-01",
        "leaseEndDate": "2027-02-28"
    }
    post_res = client.post('/api/v1/tenant', json=tenant_data)
    assert post_res.status_code == 201
    tenant_id = post_res.json["id"]

    # read the tenant
    get_res = client.get(f'/api/v1/tenant/{tenant_id}')
    assert get_res.status_code == 200
    assert get_res.json["name"] == "John Doe"

    # update the tenant
    tenant_data["firstName"] = "Jonathan"
    put_res = client.put(f'/api/v1/tenant/{tenant_id}', json=tenant_data)
    assert put_res.status_code == 200

    # remove the tenant
    del_res = client.delete(f'/api/v1/tenant/{tenant_id}')
    assert del_res.status_code == 200

    # delete the property   
    client.delete(f'/api/v1/property/{property_id}')