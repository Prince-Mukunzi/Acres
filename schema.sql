--Properties table

CREATE TABLE Property (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(50),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE Unit (
    id UUID PRIMARY KEY,
    unitName VARCHAR(20) NOT NULL,
    rentAmount BIGINT,
    unitStatus ENUM("OCCUPIED", "VACANT"),
    propertyId UUID,
    CONSTRAINTS fk_propertyId FOREIGN KEY (propertyId) REFERENCES Property (id) ON DELETE CASCADE
)

CREATE TABLE Tenant (
    id UUID PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    phoneNumber VARCHAR(20),
    unitID UUID,
    leaseStartDate DATE DEFAULT CURRENT_DATE,
    leaseEndDate DATE DEFAULT CURRENT_DATE,
    CONSTRAINTS fk_unitID FOREIGN KEY (unitID) REFERENCES Unit (id) ON DELETE CASCADE
)

CREATE TABLE MaintenanceTicket (
    id UUID PRIMARY KEY,
    unitID UUID,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM("RECEIVED", "IN_PROGRESS", "COMPLETED") DEFAULT "RECEIVED",
    isResolved BOOLEAN DEFAULT TRUE

);
-- 
        -- id        UUID PRIMARY KEY,
        -- tenantID  UUID,
        -- unitID    UUID,                     -- ← define the column
        -- title     VARCHAR(100) NOT NULL,
        -- description TEXT,
        -- status    ENUM('RECEIVED','IN_PROGRESS'CREATE TABLE Request (,'COMPLETED') 
        --             DEFAULT 'RECEIVED',
        -- isResolved BOOLEAN,
        -- createdAt DATE DEFAULT CURRENT_DATE,
        -- CONSTRAINT fk_unitID              -- ← singular
        --     FOREIGN KEY (unitID)
        --     REFERENCES Unit(id) ON DELETE CASCADE
    );                                   -- end of table
    
CREATE TABLE Communication (
        id UUID PRIMARY KEY,
        tenantID UUID,
        title VARCHAR(100) NOT NULL,
        body TEXT,
        sentAt DATETIME DEFAULT CURRENT_DATETIME,
        CONSTRAINT fk_tenantID FOREIGN KEY (tenantID)
            REFERENCES Tenant(id) ON DELETE CASCADE
    
    createdAt DATE DEFAULT CURRENT_DATE,
    CONSTRAINTS fk_unitID FOREIGN KEY (unitID) REFERENCES Unit (id) ON DELETE CASCADE
);

CREATE TABLE Communication (
    id UUID PRIMARY KEY,
    tenantID UUID,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    sentAt DATETIME DEFAULT CURRENT_DATETIME,
    CONSTRAINTS fk_tenantID FOREIGN KEY (tenantID) REFERENCES Tenant (id) ON DELETE CASCADE
)