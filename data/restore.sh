# Restore data from files into Mongo
for e in nodes links
do
  mongoimport --db ngd --collection ${e} --drop --file ${e}.json
done
