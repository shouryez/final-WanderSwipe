-- Add demo community posts with realistic travel content
-- Note: Replace with actual image URLs if storage is configured

INSERT INTO community_posts (user_email, user_name, place_name, place_lat, place_lon, image_url, caption, likes_count, created_at) VALUES
  ('priya.sharma@example.com', 'Priya Sharma', 'Taj Mahal, Agra', 27.1751, 78.0421, 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800', 'Witnessed the most beautiful sunrise at the Taj Mahal! The marble changes colors as the sun rises. Truly a wonder of the world. Tip: Go early morning to avoid crowds!', 142, NOW() - INTERVAL '3 days'),
  
  ('rahul.mehta@example.com', 'Rahul Mehta', 'Goa Beaches', 15.2993, 74.1240, 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', 'Beach hopping in Goa was incredible! Started at Baga, ended at Palolem. The sunsets here are absolutely magical. Perfect blend of relaxation and adventure!', 198, NOW() - INTERVAL '5 days'),
  
  ('sneha.patel@example.com', 'Sneha Patel', 'Leh-Ladakh', 34.1526, 77.5770, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800', 'Conquered the highest motorable roads! Ladakh is every adventure lover''s dream. The Pangong Lake left me speechless. Worth every bumpy ride!', 256, NOW() - INTERVAL '1 week'),
  
  ('amit.kumar@example.com', 'Amit Kumar', 'Kerala Backwaters', 9.4981, 76.3388, 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800', 'Houseboat cruise through the backwaters was the most peaceful experience ever. Woke up to birds chirping and water rippling. Pure bliss! Must visit for anyone seeking tranquility.', 167, NOW() - INTERVAL '10 days'),
  
  ('anjali.reddy@example.com', 'Anjali Reddy', 'Jaipur City Palace', 26.9255, 75.8237, 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800', 'The Pink City lived up to its name! The City Palace is a stunning blend of Rajput and Mughal architecture. Don''t miss the Hawa Mahal at sunset!', 189, NOW() - INTERVAL '12 days'),
  
  ('vikram.singh@example.com', 'Vikram Singh', 'Manali Mountains', 32.2432, 77.1892, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800', 'Paragliding over Solang Valley was the thrill of a lifetime! Manali offers the perfect mix of adventure and scenic beauty. The snow-capped peaks are breathtaking!', 212, NOW() - INTERVAL '2 weeks'),
  
  ('divya.nair@example.com', 'Divya Nair', 'Varanasi Ghats', 25.3176, 82.9739, 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800', 'The Ganga Aarti at Dashashwamedh Ghat was a spiritual experience like no other. The energy, the chants, the lamps floating on the river - unforgettable!', 178, NOW() - INTERVAL '3 weeks'),
  
  ('rohan.joshi@example.com', 'Rohan Joshi', 'Hampi Ruins', 15.3350, 76.4600, 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800', 'Exploring the ancient ruins of Hampi felt like traveling back in time. Every stone tells a story. Perfect destination for history buffs and photographers!', 145, NOW() - INTERVAL '1 month'),
  
  ('meera.gupta@example.com', 'Meera Gupta', 'Udaipur Lake Palace', 24.5761, 73.6813, 'https://images.unsplash.com/photo-1599661046289-e3189784641c?w=800', 'Udaipur is the most romantic city in India! Boat ride on Lake Pichola at sunset with the City Palace in view - it doesn''t get better than this!', 223, NOW() - INTERVAL '5 weeks'),
  
  ('arjun.verma@example.com', 'Arjun Verma', 'Rishikesh River Rafting', 30.0869, 78.2676, 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800', 'White water rafting on the Ganges was an adrenaline rush! Rishikesh is the adventure capital of India. Also tried bungee jumping - absolutely insane experience!', 194, NOW() - INTERVAL '6 weeks'),
  
  ('kavya.iyer@example.com', 'Kavya Iyer', 'Coorg Coffee Plantations', 12.3375, 75.8069, 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800', 'Walking through the coffee plantations in Coorg is therapeutic. The aroma, the greenery, the cool weather - Scotland of India truly deserves its name!', 156, NOW() - INTERVAL '2 months'),
  
  ('karan.saxena@example.com', 'Karan Saxena', 'Jaisalmer Desert Camp', 26.9157, 70.9083, 'https://images.unsplash.com/photo-1580836572829-d56024b4bbc8?w=800', 'Camping under the stars in the Thar Desert was magical! Camel safari at sunset, traditional Rajasthani dinner, and folk music by the bonfire. Golden City is pure gold!', 201, NOW() - INTERVAL '10 weeks');
