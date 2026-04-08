#!/bin/sh

ROOT_PASS="root"
REPL_USER="replicator"
REPL_PASS="replicator123"
DB_NAME="pulsenet"

M="mysql  -h127.0.0.1       -P3306 -uroot -p${ROOT_PASS} --protocol=TCP --connect-timeout=5"
S1="mysql -hpulsenet-slave1 -P3306 -uroot -p${ROOT_PASS} --protocol=TCP --connect-timeout=5"
S2="mysql -hpulsenet-slave2 -P3306 -uroot -p${ROOT_PASS} --protocol=TCP --connect-timeout=5"

SCHEMA_FILE="/tmp/pulsenet_schema.sql"

echo ""
echo "========================================================"
echo "  PulseNet MySQL Replication Setup"
echo "========================================================"

wait_mysql() {
    HOST=$1; NAME=$2
    printf "  Waiting for %s" "$NAME"
    i=0
    while [ $i -lt 30 ]; do
        mysql -h"$HOST" -P3306 -uroot -p"$ROOT_PASS" --protocol=TCP \
            --connect-timeout=3 -e "SELECT 1" > /dev/null 2>&1 \
            && echo " OK" && return 0
        printf "."; sleep 3; i=$((i+1))
    done
    echo " TIMEOUT"; exit 1
}

echo ""
echo "[ 1/5 ] Checking node availability..."
wait_mysql "127.0.0.1"       "Master"
wait_mysql "pulsenet-slave1" "Slave1"
wait_mysql "pulsenet-slave2" "Slave2"
sleep 2

echo ""
echo "[ 2/5 ] Creating schema on Master..."

$M -e "DROP DATABASE IF EXISTS ${DB_NAME};"
$M -e "CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

$M ${DB_NAME} << 'SQL'

CREATE TABLE IF NOT EXISTS users (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    username       VARCHAR(40)          UNIQUE NOT NULL,
    email          VARCHAR(255)         UNIQUE NOT NULL,
    password_hash  VARCHAR(500)                NOT NULL,
    first_name     VARCHAR(50)                 NOT NULL,
    last_name      VARCHAR(50)                 NOT NULL,
    bio            VARCHAR(300)                DEFAULT NULL,
    profile_image  TEXT                        DEFAULT NULL,
    role           ENUM('user','admin')        NOT NULL DEFAULT 'user',
    created_at     DATETIME                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_username CHECK (
        CHAR_LENGTH(username) >= 3 AND
        username REGEXP '^[a-zA-Z0-9-]+$'
    ),
    CONSTRAINT chk_email CHECK (CHAR_LENGTH(email) >= 5),
    CONSTRAINT chk_bio CHECK (bio IS NULL OR CHAR_LENGTH(bio) <= 300)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

CREATE TABLE IF NOT EXISTS communities (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(80)              UNIQUE NOT NULL,
    description VARCHAR(500)                    DEFAULT NULL,
    rules       TEXT                            DEFAULT NULL,
    avatar      TEXT                            DEFAULT NULL,
    type        ENUM('public','private')        NOT NULL DEFAULT 'public',
    creator_id  INT                             NOT NULL,
    created_at  DATETIME                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_name CHECK (CHAR_LENGTH(name) >= 2),
    CONSTRAINT fk_community_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_communities_type    ON communities(type);
CREATE INDEX idx_communities_creator ON communities(creator_id);

CREATE TABLE IF NOT EXISTS tags (
    id   INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    title        VARCHAR(200) NOT NULL,
    content      TEXT         NOT NULL,
    media_url    TEXT         DEFAULT NULL,
    community_id INT          NOT NULL,
    author_id    INT          NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_author    FOREIGN KEY (author_id)    REFERENCES users(id)        ON DELETE CASCADE,
    CONSTRAINT chk_title   CHECK (CHAR_LENGTH(title)   >= 5  AND CHAR_LENGTH(title)   <= 200),
    CONSTRAINT chk_content CHECK (CHAR_LENGTH(content) >= 10 AND CHAR_LENGTH(content) <= 10000)
);

CREATE INDEX idx_posts_community ON posts(community_id);
CREATE INDEX idx_posts_author    ON posts(author_id);
CREATE INDEX idx_posts_created   ON posts(created_at DESC);

CREATE TABLE IF NOT EXISTS comments (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    content    VARCHAR(2000) NOT NULL,
    post_id    INT           NOT NULL,
    author_id  INT           NOT NULL,
    parent_id  INT           DEFAULT NULL,
    is_deleted TINYINT(1)   NOT NULL DEFAULT 0,
    is_flagged TINYINT(1)   NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_post   FOREIGN KEY (post_id)   REFERENCES posts(id)    ON DELETE CASCADE,
    CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    CONSTRAINT chk_comment_content CHECK (CHAR_LENGTH(content) >= 1 AND CHAR_LENGTH(content) <= 2000)
);

CREATE INDEX idx_comments_post   ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

CREATE TABLE IF NOT EXISTS audits (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT          DEFAULT NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50)  NOT NULL,
    entity_id   INT          DEFAULT NULL,
    details     TEXT         DEFAULT NULL,
    ip_address  VARCHAR(45)  DEFAULT NULL,
    user_agent  TEXT         DEFAULT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audits_user    ON audits(user_id);
CREATE INDEX idx_audits_created ON audits(created_at DESC);

CREATE TABLE IF NOT EXISTS community_members (
    user_id      INT                               NOT NULL,
    community_id INT                               NOT NULL,
    role         ENUM('moderator','member')        NOT NULL DEFAULT 'member',
    status       ENUM('active','pending','banned') NOT NULL DEFAULT 'active',
    joined_at    DATETIME                          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, community_id),
    CONSTRAINT fk_cm_user      FOREIGN KEY (user_id)      REFERENCES users(id)       ON DELETE CASCADE,
    CONSTRAINT fk_cm_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_tags (
    post_id INT NOT NULL,
    tag_id  INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    CONSTRAINT fk_pt_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_pt_tag  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_likes (
    user_id  INT      NOT NULL,
    post_id  INT      NOT NULL,
    liked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    CONSTRAINT fk_pl_user FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_pl_post FOREIGN KEY (post_id) REFERENCES posts(id)  ON DELETE CASCADE
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);

CREATE TABLE IF NOT EXISTS comment_likes (
    user_id    INT      NOT NULL,
    comment_id INT      NOT NULL,
    liked_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, comment_id),
    CONSTRAINT fk_cl_user    FOREIGN KEY (user_id)    REFERENCES users(id)     ON DELETE CASCADE,
    CONSTRAINT fk_cl_comment FOREIGN KEY (comment_id) REFERENCES comments(id)  ON DELETE CASCADE
);

CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);

CREATE TABLE IF NOT EXISTS user_follows (
    follower_id  INT      NOT NULL,
    following_id INT      NOT NULL,
    followed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT fk_uf_follower  FOREIGN KEY (follower_id)  REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_uf_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX idx_user_follows_following ON user_follows(following_id);

SQL

echo "  Schema created"

echo ""
echo "[ 3/5 ] Locking Master and reading binlog position..."

$M -e "FLUSH TABLES WITH READ LOCK;"

STATUS=$($M -e "SHOW MASTER STATUS\G" 2>/dev/null)
MASTER_FILE=$(echo "$STATUS" | grep "File:"     | awk '{print $2}')
MASTER_POS=$( echo "$STATUS" | grep "Position:" | awk '{print $2}')

echo "  Binlog file: $MASTER_FILE"
echo "  Position:    $MASTER_POS"

echo ""
echo "[ 4/5 ] Dumping schema to slaves..."

mysqldump -h127.0.0.1 -P3306 -uroot -p${ROOT_PASS} \
    --protocol=TCP \
    --single-transaction \
    --skip-lock-tables \
    ${DB_NAME} > ${SCHEMA_FILE}

$S1 -e "DROP DATABASE IF EXISTS ${DB_NAME}; CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
$S1 ${DB_NAME} < ${SCHEMA_FILE}
echo "  Slave1: schema imported"

$S2 -e "DROP DATABASE IF EXISTS ${DB_NAME}; CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
$S2 ${DB_NAME} < ${SCHEMA_FILE}
echo "  Slave2: schema imported"

$M -e "UNLOCK TABLES;"
echo "  Master unlocked"

echo ""
echo "[ 5/5 ] Configuring replication..."

$M -e "
    CREATE USER IF NOT EXISTS '${REPL_USER}'@'%'
        IDENTIFIED WITH mysql_native_password BY '${REPL_PASS}';
    GRANT REPLICATION SLAVE ON *.* TO '${REPL_USER}'@'%';
    FLUSH PRIVILEGES;
"

for SLAVE_HOST in pulsenet-slave1 pulsenet-slave2; do
    mysql -h"$SLAVE_HOST" -P3306 -uroot -p"$ROOT_PASS" --protocol=TCP --connect-timeout=5 -e "
        STOP SLAVE;
        CHANGE MASTER TO
            MASTER_HOST='pulsenet-master',
            MASTER_USER='${REPL_USER}',
            MASTER_PASSWORD='${REPL_PASS}',
            MASTER_LOG_FILE='${MASTER_FILE}',
            MASTER_LOG_POS=${MASTER_POS};
        START SLAVE;
    "

    IO=$(mysql -h"$SLAVE_HOST" -P3306 -uroot -p"$ROOT_PASS" --protocol=TCP --connect-timeout=5 \
        -e "SHOW SLAVE STATUS\G" 2>/dev/null | grep "Slave_IO_Running:" | awk '{print $2}')
    SQL_R=$(mysql -h"$SLAVE_HOST" -P3306 -uroot -p"$ROOT_PASS" --protocol=TCP --connect-timeout=5 \
        -e "SHOW SLAVE STATUS\G" 2>/dev/null | grep "Slave_SQL_Running:" | awk '{print $2}')

    if [ "$IO" = "Yes" ] && [ "$SQL_R" = "Yes" ]; then
        echo "  $SLAVE_HOST: replication active"
    else
        echo "  $SLAVE_HOST: WARNING - IO=$IO SQL=$SQL_R"
    fi
done

echo ""
echo "========================================================"
echo "  Setup complete"
echo "  Master:  pulsenet-master:3306"
echo "  Slave1:  pulsenet-slave1:3307"
echo "  Slave2:  pulsenet-slave2:3308"
echo "  DB:      ${DB_NAME}"
echo "========================================================"