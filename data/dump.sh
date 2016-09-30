# Dump data from Mongo into files
for e in nodes links
do
  mongoexport --db ngd --collection ${e} --out ${e}.json
done
