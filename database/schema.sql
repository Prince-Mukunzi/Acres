-- AppUser table
CREATE TABLE IF NOT EXISTS AppUser (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    picture TEXT,
    provider VARCHAR(20) DEFAULT 'google',
    isAdmin BOOLEAN DEFAULT FALSE,
    isSuspended BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastLogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE IF NOT EXISTS Property (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    userId UUID,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isDeleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_userId FOREIGN KEY (userId) REFERENCES AppUser (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Unit (
    id UUID PRIMARY KEY,
    unitName VARCHAR(50) NOT NULL,
    rentAmount BIGINT,
    unitStatus VARCHAR(20) CHECK (unitStatus IN ('OCCUPIED', 'VACANT')) DEFAULT 'VACANT',
    propertyId UUID,
    userId UUID,
    isDeleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_propertyId FOREIGN KEY (propertyId) REFERENCES Property (id) ON DELETE CASCADE,
    CONSTRAINT fk_unit_userId FOREIGN KEY (userId) REFERENCES AppUser (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Tenant (
    id UUID PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    phoneNumber VARCHAR(20),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    unitID UUID,
    leaseStartDate DATE DEFAULT CURRENT_DATE,
    leaseEndDate DATE DEFAULT CURRENT_DATE,
    userId UUID,
    isDeleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_unitID FOREIGN KEY (unitID) REFERENCES Unit (id) ON DELETE CASCADE,
    CONSTRAINT fk_tenant_userId FOREIGN KEY (userId) REFERENCES AppUser (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS MaintenanceTicket (
    id UUID PRIMARY KEY,
    unitID UUID,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('RECEIVED', 'IN_PROGRESS', 'COMPLETED')) DEFAULT 'RECEIVED',
    isResolved BOOLEAN DEFAULT FALSE,
    userId UUID,
    isDeleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_ticket_unitID FOREIGN KEY (unitID) REFERENCES Unit (id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_userId FOREIGN KEY (userId) REFERENCES AppUser (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Communication (
    id UUID PRIMARY KEY,
    tenantID UUID,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    unitID UUID,
    userId UUID,
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isDeleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_tenantID FOREIGN KEY (tenantID) REFERENCES Tenant (id) ON DELETE CASCADE,
    CONSTRAINT fk_comm_userId FOREIGN KEY (userId) REFERENCES AppUser (id) ON DELETE CASCADE
);

