-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a dedicated lookup table for system-wide roles
CREATE TABLE global_roles (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    slug VARCHAR(50) UNIQUE NOT NULL,        -- Used in backend code logic (e.g., 'org_admin')
    name VARCHAR(100) UNIQUE NOT NULL,              -- Friendly UI display name (e.g., 'Organization Administrator')
    description TEXT,                        -- Context for what this role does
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Refactor your users table to point to the roles table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    
    -- The Foreign Key relationship replaces the raw VARCHAR string
    global_role_id INT NOT NULL REFERENCES global_roles(id),
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects Table (Context Provider)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'PROJ', 'ENG'
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Project Roles Lookup Table
CREATE TABLE project_roles (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(50) UNIQUE NOT NULL -- 'Project Admin', 'Developer', 'Viewer'
);

-- 4. The Junction Table: Contextual User Roles (The Secret Sauce)
CREATE TABLE project_memberships (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id INT REFERENCES project_roles(id),
    PRIMARY KEY (project_id, user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning-fast permission checks
CREATE INDEX idx_project_memberships_user ON project_memberships(user_id);

-- Index the foreign key for optimized JOIN queries when fetching profiles
CREATE INDEX idx_users_global_role_id ON users(global_role_id);