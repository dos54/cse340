/*===============================================
File: assignment2.sql
Author: Steven Thomas
Date: January 12, 2025
Purpose: Demonstrate CRUD operations as detailed
    in assignment #2
===============================================*/


-- ==============================================
-- Section: Tony Stark
-- ===============================================
INSERT INTO public.account(
    account_firstname,
    account_lastname,
    account_email,
    account_password
) VALUES (
    'Tony',
    'Stark',
    'tony@starkent.com',
    'Iam1ronM@n'
);
UPDATE public.account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony' and
    account_lastname = 'Stark' and
    account_email = 'tony@starkent.com'
;
-- Query 3
DELETE FROM public.account
WHERE account_id = 1;

-- ==============================================
-- Section: Vehicle Stuffs
-- ===============================================
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = 10;
SELECT 
    inv_make AS "Make",
    inv_model AS "Model",
    classification_name AS "Category"
FROM
    public.inventory
INNER JOIN public.classification
    ON public.classification.classification_id = public.inventory.classification_id
WHERE
    classification_name = 'Sport'
;
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, 'images/', 'images/vehicles'),
    inv_thumbnail = REPLACE(inv_thumbnail, 'images/', 'images/vehicles')
WHERE inv_image NOT LIKE '%images/vehicles%'
    OR inv_thumbnail NOT LIKE '%images/vehicles%'
;