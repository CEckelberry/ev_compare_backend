INSERT INTO users (username, email, phone_number, profile_image, is_admin)
VALUES (1,
        'testuser',
        'test@test.com',
        '555-555-5555',
        FALSE),
       (2,
        'testadmin',
        'testadmin@test.com',
        '555-555-5555',
        TRUE);


INSERT INTO vehicles (make, model, safety_rating, "length", width, height, body_type, chargeport, year, car_image)
VALUES               ('Tesla', 'Model 3', 5, 185, 73, 57, 'Sedan', 'Tesla', 2021, 'https://tesla-cdn.thron.com/delivery/public/image/tesla/c82315a6-ac99-464a-a753-c26bc0fb647d/bvlatuR/std/1200x628/lhd-model-3-social'),
                     ('Nissan', 'Leaf', 5, 177, 70, 60, 'Hatchback', 'CHAdeMO', 2021, 'https://cimg1.ibsrv.net/ibimg/hgm/1920x1080-1/100/774/2021-nissan-leaf_100774917.jpg');


INSERT INTO versions (version_name, price, range, battery_capacity, efficiency, seats, weight, charge_time, available_now, acceleration, "power", torque, drive, towing_capacity, model_id)
VALUES ('Long Range Dual Motor', 48490, 353, 82, 116, 5, 4231, '28', TRUE, 4.2, 346, 376, 'AWD', 2000, 1),
       ('Standard Range Plus', 39490, 263, 54, 141, 5, 3627, '20', TRUE, 5.3, 283, 330, 'RWD', 2000, 1),
       ('Leaf Plus', 38270, 226, 62, 114, 5, 3620, 40, TRUE, 8.4, 215, 236, 'FWD', 2000, 2);
