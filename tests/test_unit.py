import pytest
from app import app



def test_unit_crud_lifecycle(client):
    # create a temporary property
    prop_res = client.post('/api/v1/property', json={"name": "Temp Unit Prop", "address": "123 Test"})
    property_id = prop_res.json["id"]

    # 2. create the unit
    unit_data = {
        "unitName": "Apt 101",
        "rentAmount": 1500,
        "unittatus": "VACANT",
        "propertyId": property_id
    }
    post_res = client.post('/api/v1/unit', json=unit_data)
    assert post_res.status_code == 201
    unit_id = post_res.json["id"]

    # read the unit
    get_res = client.get(f'/api/v1/unit/{unit_id}')
    assert get_res.status_code == 200
    assert get_res.json["name"] == "Apt 101"

    # update the unit
    update_data = {
        "unitName": "Apt 101-B",
        "rentAmount": 1600,
        "unittatus": "OCCUPIED",
        "propertyId": property_id
    }
    put_res = client.put(f'/api/v1/unit/{unit_id}', json=update_data)
    assert put_res.status_code == 200

    # remove the unit
    del_res = client.delete(f'/api/v1/unit/{unit_id}')
    assert del_res.status_code == 200

    # delete the temporary property
    client.delete(f'/api/v1/property/{property_id}')
