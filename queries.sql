-- Creating the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    otp_hash TEXT,
    otp_created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT false,
    user_created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Creating the notes table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    AI_response TEXT,
    user_id INT REFERENCES users(id) 
);
