\echo 'Delete and recreate ev db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE evs;
CREATE DATABASE evs;
\connect evs

\i ev_schema.sql
\i ev-seed.sql

\echo 'Delete and recreate evs_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE evs_test;
CREATE DATABASE evs_test;
\connect evs_test

\i ev_schema.sql
