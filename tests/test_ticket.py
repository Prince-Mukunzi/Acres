import pytest
from app import app



def test_ticket_crud_lifecycle(client):
    # create property and unit
    prop_res = client.post('/api/v1/property', json={"name": "Temp Ticket Prop"})
    property_id = prop_res.json["id"]
    
    unit_res = client.post('/api/v1/unit', json={"unitName": "M-101", "propertyId": property_id})
    unit_id = unit_res.json["id"]

    # create the ticket
    ticket_data = {
        "unitID": unit_id,
        "description": "Dripping water in the kitchen",
        "isResolved": False
    }
    post_res = client.post('/api/v1/ticket', json=ticket_data)
    assert post_res.status_code == 201
    ticket_id = post_res.json["id"]

    # read the ticket
    get_res = client.get(f'/api/v1/ticket/{ticket_id}')
    assert get_res.status_code == 200
    # assert get_res.json["title"] == "Leaky Faucet"

    # update the ticket
    ticket_data["isResolved"] = False
    put_res = client.put(f'/api/v1/ticket/{ticket_id}', json=ticket_data)
    assert put_res.status_code == 200

    # remove the ticket
    del_res = client.delete(f'/api/v1/ticket/{ticket_id}')
    assert del_res.status_code == 200

    # delete parent property
    client.delete(f'/api/v1/property/{property_id}')
