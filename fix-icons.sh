#!/bin/bash
cd /home/ubuntu/content-factory/src

# Fix all files that import Twitter, Linkedin, Instagram, Youtube from lucide-react
# Replace with our platform-icons utility

FILES=$(grep -rl "Twitter.*Linkedin\|Linkedin.*Twitter\|Instagram.*Youtube\|Youtube.*Instagram" --include="*.tsx" .)

for f in $FILES; do
  echo "Fixing $f"
  
  # Remove Twitter, Linkedin, Instagram, Youtube from lucide-react imports
  sed -i 's/Twitter, //g' "$f"
  sed -i 's/, Twitter//g' "$f"
  sed -i 's/Linkedin, //g' "$f"
  sed -i 's/, Linkedin//g' "$f"
  sed -i 's/Instagram, //g' "$f"
  sed -i 's/, Instagram//g' "$f"
  sed -i 's/Youtube, //g' "$f"
  sed -i 's/, Youtube//g' "$f"
done

echo "Done"
