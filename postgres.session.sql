SELECT COUNT(*)
FROM "Users"
WHERE id <= 1000 AND "firstName" = 'Bart';

-- delete from "Users" where id > 0;

-- SELECT setval('Users_id_seq', 1);