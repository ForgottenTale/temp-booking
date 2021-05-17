module.exports = {
    schema: [
        `CREATE TABLE IF NOT EXISTS person(
            _id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(15)
        );`,
        `CREATE TABLE IF NOT EXISTS user(
            _id INT PRIMARY KEY AUTO_INCREMENT,
            person_id INT UNIQUE,
            password VARCHAR(80),
            super_admin BOOLEAN DEFAULT false,
            super_creator BOOLEAN DEFAULT false,
            FOREIGN KEY (person_id) REFERENCES person(_id)
        );`,
        `CREATE TABLE IF NOT EXISTS hash(
            person_id INT UNIQUE,
            hash VARCHAR(80),
            FOREIGN KEY (person_id) REFERENCES person(_id)
        );`,
        `CREATE TABLE IF NOT EXISTS ou(
            _id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100)
        );`,
        `CREATE TABLE IF NOT EXISTS service_config(
            _id INT PRIMARY KEY AUTO_INCREMENT,
            type VARCHAR(20) NOT NULL,
            service_name VARCHAR(30),
            global_restraint BOOLEAN DEFAULT 1,
            group_restraint BOOLEAN DEFAULT 1,
            reviewer_restraint BOOLEAN DEFAULT 0,
            advance_days INT DEFAULT 5,
            padding_between_bookings_mins INT DEFAULT 15
        );`,
        `CREATE TABLE IF NOT EXISTS ou_map(
            ou_id INT,
            person_id INT,
            role VARCHAR(50),
            admin BOOLEAN DEFAULT FALSE,
            FOREIGN KEY(ou_id) REFERENCES ou(_id),
            FOREIGN KEY(person_id) REFERENCES person(_id)
        );`,
        `CREATE TABLE IF NOT EXISTS reviewer_map(
            user_id INT,
            service_id INT,
            FOREIGN KEY (user_id) REFERENCES user(_id),
            FOREIGN KEY (service_id) REFERENCES service_config(_id)
        );`,
        `CREATE TABLE IF NOT EXISTS online_meeting(
            _id INT PRIMARY KEY AUTO_INCREMENT,
            service_name VARCHAR(30) NOT NULL,
            title VARCHAR(30) NOT NULL,
            description VARCHAR(200),
            img VARCHAR(255),
            url VARCHAR(255) DEFAULT 'WILL BE UPDATED',
            meeting_password VARCHAR(50) DEFAULT 'WILL BE UPDATED',
            comments VARCHAR(30),
            start_time DATETIME NOT NULL,
            end_time DATETIME NOT NULL,
            speaker_name VARCHAR(30) NOT NULL,
            speaker_email VARCHAR(30) NOT NULL,
            co_hosts JSON
        );`,
        `CREATE TABLE IF NOT EXISTS intern_support(
            _id INT PRIMARY KEY AUTO_INCREMENT,
            service_name VARCHAR(30) NOT NULL,
            title VARCHAR(30) NOT NULL,
            description VARCHAR(200),
            comments VARCHAR(30),
            start_time DATETIME NOT NULL,
            end_time DATETIME NOT NULL,
            words_count INT,
            purpose VARCHAR(30),
            dimensions VARCHAR(20),
            url VARCHAR(100),
            img VARCHAR(50)
        );`,
        `CREATE TABLE IF NOT EXISTS e_notice(
            _id INT PRIMARY KEY AUTO_INCREMENT,
            service_name VARCHAR(30) NOT NULL,
            title VARCHAR(30) NOT NULL,
            description VARCHAR(200),
            img VARCHAR(50),
            comments VARCHAR(30),
            publish_time DATETIME NOT NULL,
            express BOOLEAN NOT NULL DEFAULT false,
            reminder DATETIME NOT NULL
            
        );`,
        `CREATE TABLE IF NOT EXISTS publicity(
            _id INT PRIMARY KEY AUTO_INCREMENT,
            service_name VARCHAR(30) NOT NULL,
            title VARCHAR(30) NOT NULL,
            description VARCHAR(200) NOT NULL,
            img VARCHAR(50),
            comments VARCHAR(30),
            publish_time DATETIME NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS blt(
            _id INT PRIMARY KEY AUTO_INCREMENT,
            online_meeting_id INT,
            intern_support_id INT,
            e_notice_id INT,
            publicity_id INT,
            creator_id INT NOT NULL,
            status VARCHAR(10) DEFAULT "PENDING",
            level TINYINT DEFAULT 3,
            ou_id INT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
            approved_at DATETIME,
            FOREIGN KEY(online_meeting_id) REFERENCES online_meeting(_id),
            FOREIGN KEY(intern_support_id) REFERENCES intern_support(_id),
            FOREIGN KEY(e_notice_id) REFERENCES e_notice(_id),
            FOREIGN KEY(publicity_id) REFERENCES publicity(_id),
            FOREIGN KEY(creator_id) REFERENCES user(_id),
            FOREIGN KEY(ou_id) REFERENCES ou(_id)
        );`,
        `CREATE TABLE IF NOT EXISTS replies(
            _id INT PRIMARY KEY AUTO_INCREMENT,
            blt_id INT,
            person_id INT,
            FOREIGN KEY(blt_id) REFERENCES blt(_id),
            FOREIGN KEY(person_id) REFERENCES person(_id)
        );`,
        `CREATE TABLE IF NOT EXISTS next_to_approve(
            person_id INT NOT NULL,
            blt_id INT NOT NULL,
            FOREIGN KEY (person_id) REFERENCES person(_id),
            FOREIGN KEY (blt_id) REFERENCES blt(_id)
        );`,
        `CREATE TABLE IF NOT EXISTS response(
            person_id INT NOT NULL,
            blt_id INT NOT NULL,
            encourages BOOLEAN,
            response VARCHAR(100),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(person_id) REFERENCES person(_id),
            FOREIGN KEY(blt_id) REFERENCES blt(_id) 
        );`,
        `CREATE TABLE IF NOT EXISTS feedback(
            user_id INT NOT NULL,
            type VARCHAR(50),
            text VARCHAR(300),
            FOREIGN KEY(user_id) REFERENCES user(_id)
        );`,
        `CREATE TABLE IF NOT EXISTS reset_id(
            _id VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL
        );`
    ]
}