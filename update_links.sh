#!/bin/bash
# Find and replace Genspark URLs in index.html and all other HTML files

# Replace Genspark domain links with curriculumsocial.com
find . -name "*.html" -exec sed -i.bak 's|https://[a-zA-Z0-9]*\.gensparkspace\.com/|https://curriculumsocial.com/|g' {} \;
find . -name "*.html" -exec sed -i.bak 's|https://[a-zA-Z0-9]*\.genspark\.site/|https://curriculumsocial.com/|g' {} \;

# Also catch any other Genspark variations
find . -name "*.html" -exec sed -i.bak 's|https://[a-zA-Z0-9]*\.genspark[a-zA-Z0-9]*\.[a-zA-Z]*/|https://curriculumsocial.com/|g' {} \;

echo "Links updated successfully!"
