-- ==========================================================
-- DDL MIGRATION: TELKOMSEL NW RF NATIONAL TRACKER & ISDP
-- Database: db_productivity_tsel (Microsoft SQL Server)
-- Memuat seluruh 45 kolom lengkap dari sheet Tracker & Data ISDP
-- ==========================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Assignments')
BEGIN
    CREATE TABLE Assignments (
        -- Primary Key Komposit: DU_ID + '|' + ISNULL(PMO_Uniq, 'NA')
        Record_ID NVARCHAR(205) NOT NULL PRIMARY KEY,
        
        -- 29 Kolom Sheet Telkomsel NW RF National Tracke
        PMO_Uniq NVARCHAR(100) NULL,
        DU_ID NVARCHAR(100) NOT NULL,
        Site_ID NVARCHAR(50) NOT NULL,
        Site_Name NVARCHAR(255) NOT NULL,
        Program_ID NVARCHAR(255) NULL,
        DU_Model NVARCHAR(100) NULL,
        Area NVARCHAR(100) NOT NULL,
        Kabupaten NVARCHAR(150) NOT NULL,
        Longitude DECIMAL(11, 7) NULL,
        Latitude DECIMAL(10, 7) NULL,
        PO_Release NVARCHAR(100) NULL,
        Status_PO NVARCHAR(50) NULL,
        M06_Date DATE NULL,
        OA_Date DATE NULL,                          -- Tanggal Connected / On Air
        DT_Date DATE NULL,                          -- Tanggal Drive Test
        Audit_Date DATE NULL,                       -- Tanggal Audit Parameter
        QC_Accepted_Done_Review DATE NULL,          -- QC Accepted (done review)
        QC_RF_Date DATE NULL,                       -- QC RF Acceptance Date
        RF_Cat_Issue_Level2 NVARCHAR(100) NULL,
        PIC_Progress_RF NVARCHAR(100) NULL,
        PIC_RF NVARCHAR(100) NULL,
        ISDP_Status NVARCHAR(100) NULL,
        Remark NVARCHAR(MAX) NULL,
        Milestone_NW NVARCHAR(100) NOT NULL,
        Issue_DT_Audit NVARCHAR(255) NULL,
        Aging INT NULL,
        Aging_Category NVARCHAR(50) NULL,
        Current_Status_ISDP NVARCHAR(100) NULL,
        Simple_ISDP NVARCHAR(100) NULL,
        Simple_Milestone NVARCHAR(100) NULL,

        -- 9 Kolom Ekstraksi Sheet Data ISDP
        ISDP_PO_NO NVARCHAR(100) NULL,
        ISDP_QC_RF_Date DATE NULL,
        ISDP_QC_RF NVARCHAR(100) NULL,
        ISDP_SAPLO NVARCHAR(100) NULL,
        ISDP_Remark NVARCHAR(MAX) NULL,
        ISDP_Aging INT NULL,
        ISDP_Area NVARCHAR(100) NULL,
        ISDP_Appendix_Simple_ISDP NVARCHAR(100) NULL,
        ISDP_Appendix_Simple_Milestone NVARCHAR(100) NULL,

        -- Kolom Turunan Operasional
        Report_Submit_Date DATE NULL,
        Acc_Date DATE NULL,
        Coordinate_Raw NVARCHAR(100) NULL,
        Extra_Col1 NVARCHAR(100) NULL,
        Extra_Col2 NVARCHAR(100) NULL,
        Status_OA NVARCHAR(50) NOT NULL DEFAULT 'Not Yet OA',
        Status_DT NVARCHAR(50) NOT NULL DEFAULT 'NY DT',
        Final_Status NVARCHAR(50) NOT NULL DEFAULT 'Not Yet Acc',

        -- Metadata Auditing & Row Hashing
        RowHash CHAR(64) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );

    -- Non-Clustered Indexes untuk Performa Agregasi Sub-100ms
    CREATE NONCLUSTERED INDEX IX_Assignments_DU_ID ON Assignments(DU_ID);
    CREATE NONCLUSTERED INDEX IX_Assignments_Site_ID ON Assignments(Site_ID);
    CREATE NONCLUSTERED INDEX IX_Assignments_Area_Kab ON Assignments(Area, Kabupaten);
    CREATE NONCLUSTERED INDEX IX_Assignments_Simple_ISDP_MS ON Assignments(Simple_ISDP, Simple_Milestone);
    CREATE NONCLUSTERED INDEX IX_Assignments_FinalStatus ON Assignments(Final_Status, Milestone_NW);
    CREATE NONCLUSTERED INDEX IX_Assignments_StatusOA ON Assignments(Status_OA);
    CREATE NONCLUSTERED INDEX IX_Assignments_Dates ON Assignments(OA_Date, DT_Date, QC_RF_Date);
    CREATE NONCLUSTERED INDEX IX_Assignments_RowHash ON Assignments(RowHash);
    
    PRINT 'Tabel Assignments (45 kolom) berhasil dibuat.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        FullName NVARCHAR(150) NOT NULL,
        Role NVARCHAR(50) NOT NULL DEFAULT 'Viewer',
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );

    -- Seed User Default Admin (admin / 4dmin123)
    INSERT INTO Users (Username, PasswordHash, FullName, Role, IsActive)
    VALUES ('admin', '4dmin123', 'National System Administrator', 'Admin', 1);

    PRINT 'Tabel Users dan akun admin berhasil dibuat.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SyncLogs')
BEGIN
    CREATE TABLE SyncLogs (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        SyncSource NVARCHAR(50) NOT NULL, -- 'EXCEL_SEED' atau 'GSHEET_CRON'
        StartTime DATETIME2 NOT NULL,
        EndTime DATETIME2 NULL,
        TotalRowsRead INT NOT NULL DEFAULT 0,
        InsertedCount INT NOT NULL DEFAULT 0,
        UpdatedCount INT NOT NULL DEFAULT 0,
        UnchangedCount INT NOT NULL DEFAULT 0,
        GlobalSheetHash CHAR(64) NULL,
        Status NVARCHAR(50) NOT NULL,    -- 'SUCCESS', 'NO_CHANGES', 'FAILED'
        ErrorMessage NVARCHAR(MAX) NULL
    );
    CREATE NONCLUSTERED INDEX IX_SyncLogs_Source_Time ON SyncLogs(SyncSource, StartTime DESC);
    PRINT 'Tabel SyncLogs berhasil dibuat.';
END
GO
