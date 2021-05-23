CREATE TABLE favorites
(
 id        serial NOT NULL,
 vehicle_id integer NOT NULL,
 user_id    integer NOT NULL,
 CONSTRAINT PK_favorites PRIMARY KEY ( id )
);

CREATE INDEX fkIdx_50 ON favorites
(
 vehicle_id
);

CREATE INDEX fkIdx_53 ON favorites
(
 user_id
);





CREATE TABLE users
(
 id        serial NOT NULL,
 username      text NOT NULL,
 password      text NOT NULL,
 email         text NOT NULL,
 phone_number  text NOT NULL,
 profile_image text NOT NULL,
 is_admin boolean NOT NULL DEFAULT FALSE,
 CONSTRAINT PK_users PRIMARY KEY ( id )
);



CREATE TABLE vehicles
(
 id            serial NOT NULL,
 make          text NOT NULL,
 model         text NOT NULL,
 safety_rating integer NOT NULL,
 length        integer NOT NULL,
 width         integer NOT NULL,
 height        integer NOT NULL,
 body_type     text NOT NULL,
 chargeport    text NOT NULL,
 year          integer NOT NULL,
 CONSTRAINT PK_vehicles PRIMARY KEY ( id )
);



CREATE TABLE versions
(
 id              serial NOT NULL,
 version_name     text NOT NULL,
 price            money NOT NULL,
 range            integer NOT NULL,
 battery_capacity integer NOT NULL,
 efficiency       integer NOT NULL,
 seats            integer NOT NULL,
 weight           integer NOT NULL,
 charge_time      text NOT NULL,
 available_now    boolean NOT NULL,
 acceleration     real NOT NULL,
 power            integer NOT NULL,
 torque           integer NOT NULL,
 drive            text NOT NULL,
 towing_capacity  integer NOT NULL,
 model_id         integer NOT NULL,
 CONSTRAINT PK_versions PRIMARY KEY ( id )
);

CREATE INDEX fkIdx_76 ON versions
(
 model_id
);

-- favorites 
ALTER TABLE favorites ADD
    CONSTRAINT FK_49 FOREIGN KEY ( vehicle_id ) REFERENCES versions ( id );
    
ALTER TABLE favorites ADD
    CONSTRAINT FK_52 FOREIGN KEY ( user_id ) REFERENCES users ( id );

-- versions
ALTER TABLE versions ADD
    CONSTRAINT FK_75 FOREIGN KEY ( model_id ) REFERENCES vehicles ( id );
