# Password hashing using bcrypt
import heapq
import bcrypt
from datetime import datetime, date 


def hash_info(data):
    """Hash the given information using bcrypt."""
    salt = bcrypt.gensalt()
    hashed_info = bcrypt.hashpw(data.encode('utf-8'), salt)
    return hashed_info

def verify_info(data, hashed_info):
    is_valid = bcrypt.checkpw(data.encode('utf-8'), hashed_info)

    if is_valid:
        print("The information is valid.")
    else:
        print("The information is invalid.")



cache = {}           
TTL = 60


def get_cache(key):
    entry = cache.get(key)

    if entry is None:
        return None  

    age = (datetime.now() - entry["saved_at"]).total_seconds()

    if age > TTL:
        del cache[key]  
        return None

    return entry["data"]  


def create_cache(key, data):
    cache[key] = {
        "data": data,
        "saved_at": datetime.now()
    }


def clear_cache(key):
    cache.pop(key, None)

# Priority mapping for ticket statuses
# priority = {  
#     False: 0,
#     True: 1, 
# }


# def sort_tickets(tickets):

#     heap = []

#     for index, ticket in enumerate(tickets):
#         is_resolved = ticket.get("isResolved", False)
#         priority_number = priority.get(is_resolved, 0)

#         heapq.heappush(heap, (priority_number, index, ticket))

#     sorted_tickets = []
#     while heap:
#         priority_number, index, ticket = heapq.heappop(heap)
#         sorted_tickets.append(ticket)

#     return sorted_tickets


# Use actual boolean keys, not strings
priority = {  
    False: 0,
    True: 1, 
}

def sort_tickets(tickets):
    heap = []

    for index, ticket in enumerate(tickets):
        # Safely get the boolean, default to False if missing
        is_resolved = ticket.get("isResolved", False)
        
        # Look up the priority using the boolean
        priority_number = priority.get(is_resolved, 0)

        heapq.heappush(heap, (priority_number, index, ticket))

    sorted_tickets = []
    while heap:
        priority_number, index, ticket = heapq.heappop(heap)
        sorted_tickets.append(ticket)

    return sorted_tickets