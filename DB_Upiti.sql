CREATE DATABASE IF NOT EXISTS pulsenet;
USE pulsenet;

CREATE TABLE IF NOT EXISTS users (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    korisnickoIme VARCHAR(40)  UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    lozinka       VARCHAR(500)        NOT NULL,
    ime           VARCHAR(50)         NOT NULL,
    prezime       VARCHAR(50)         NOT NULL,
    bio           VARCHAR(300)        DEFAULT NULL,
    profilnaSlika TEXT                DEFAULT NULL,
    uloga         ENUM('user','admin') NOT NULL DEFAULT 'user',
    created_at    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_korisnickoIme CHECK (
        CHAR_LENGTH(korisnickoIme) >= 3 AND
        korisnickoIme REGEXP '^[a-zA-Z0-9-]+$'
    ),
    CONSTRAINT chk_email CHECK (CHAR_LENGTH(email) >= 5),
    CONSTRAINT chk_bio CHECK (bio IS NULL OR CHAR_LENGTH(bio) <= 300)
);

CREATE TABLE IF NOT EXISTS communities (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    naziv       VARCHAR(80)             UNIQUE NOT NULL,
    opis        VARCHAR(500)            DEFAULT NULL,
    pravila     TEXT                    DEFAULT NULL,
    avatar      TEXT                    DEFAULT NULL,
    tip         ENUM('public','private') NOT NULL DEFAULT 'public',
    creator_id  INT                     NOT NULL,
    created_at  DATETIME                NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_naziv CHECK (CHAR_LENGTH(naziv) >= 2),
    CONSTRAINT fk_community_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
    id    INT PRIMARY KEY AUTO_INCREMENT,
    naziv VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    naslov       VARCHAR(200) NOT NULL,
    sadrzaj      TEXT         NOT NULL,
    media_url    TEXT         DEFAULT NULL,
    community_id INT          NOT NULL,
    author_id    INT          NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_post_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_author    FOREIGN KEY (author_id)    REFERENCES users(id)        ON DELETE CASCADE,
    CONSTRAINT chk_naslov  CHECK (CHAR_LENGTH(naslov)  >= 5  AND CHAR_LENGTH(naslov)  <= 200),
    CONSTRAINT chk_sadrzaj CHECK (CHAR_LENGTH(sadrzaj) >= 10 AND CHAR_LENGTH(sadrzaj) <= 10000)
);

CREATE TABLE IF NOT EXISTS comments (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    sadrzaj    VARCHAR(2000) NOT NULL,
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
    CONSTRAINT chk_comment_sadrzaj CHECK (CHAR_LENGTH(sadrzaj) >= 1 AND CHAR_LENGTH(sadrzaj) <= 2000)
);

CREATE TABLE IF NOT EXISTS audits (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT          DEFAULT NULL,
    akcija      VARCHAR(100) NOT NULL,
    entitet_tip VARCHAR(50)  NOT NULL,
    entitet_id  INT          DEFAULT NULL,
    detalji     TEXT         DEFAULT NULL,
    ip_adresa   VARCHAR(45)  DEFAULT NULL,
    user_agent  TEXT         DEFAULT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS community_members (
    user_id      INT                               NOT NULL,
    community_id INT                               NOT NULL,
    uloga        ENUM('moderator','member')        NOT NULL DEFAULT 'member',
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

CREATE TABLE IF NOT EXISTS comment_likes (
    user_id    INT      NOT NULL,
    comment_id INT      NOT NULL,
    liked_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, comment_id),
    CONSTRAINT fk_cl_user    FOREIGN KEY (user_id)    REFERENCES users(id)     ON DELETE CASCADE,
    CONSTRAINT fk_cl_comment FOREIGN KEY (comment_id) REFERENCES comments(id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_follows (
    follower_id  INT      NOT NULL,
    following_id INT      NOT NULL,
    followed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT fk_uf_follower  FOREIGN KEY (follower_id)  REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_uf_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_no_self_follow CHECK (follower_id != following_id)
);