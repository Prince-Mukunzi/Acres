-- Properties table
CREATE TABLE Property (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Unit (
    id UUID PRIMARY KEY,
    unitName VARCHAR(20) NOT NULL,
    rentAmount BIGINT,
    unitStatus VARCHAR(20) CHECK (unitStatus IN ('OCCUPIED', 'VACANT')),
    propertyId UUID,
    CONSTRAINT fk_propertyId FOREIGN KEY (propertyId) REFERENCES Property (id) ON DELETE CASCADE
);

CREATE TABLE Tenant (
    id UUID PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    phoneNumber VARCHAR(20),
    unitID UUID,
    leaseStartDate DATE DEFAULT CURRENT_DATE,
    leaseEndDate DATE DEFAULT CURRENT_DATE,
    CONSTRAINT fk_unitID FOREIGN KEY (unitID) REFERENCES Unit (id) ON DELETE CASCADE
);

CREATE TABLE MaintenanceTicket (
    id UUID PRIMARY KEY,
    unitID UUID,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('RECEIVED', 'IN_PROGRESS', 'COMPLETED')) DEFAULT 'RECEIVED',
    isResolved BOOLEAN DEFAULT TRUE
);

CREATE TABLE Communication (
    id UUID PRIMARY KEY,
    tenantID UUID,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenantID FOREIGN KEY (tenantID) REFERENCES Tenant (id) ON DELETE CASCADE
);
