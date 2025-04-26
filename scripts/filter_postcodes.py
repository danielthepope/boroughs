#!/usr/bin/env python3

import csv
import os
import sys

usage = '''
This script takes a CSV file of postcodes, selects only the information
useful to this web app and splits it into several CSVs indexed by the
first two characters of the postcode. The input CSV can be downloaded
from https://www.getthedata.com/open-postcode-geo-london.

Usage:
./filter_postcodes.py path/to/open_postcode_geo_london.csv path/to/output_directory
'''

if len(sys.argv) != 3:
    print(usage)
    exit(1)

unfiltered_csv = sys.argv[1]
output_prefix = sys.argv[2]

lines = []

if os.path.exists(unfiltered_csv):
    with open(unfiltered_csv, 'r') as in_file:
        reader = csv.reader(in_file)
        for row in reader:
            if row[1] == 'live':
                lines.append(f'{row[9]},{row[7]},{row[8]},{row[18]}')
else:
    print(usage)
    exit(1)

current_prefix = ''

for l in lines:
    print(l)
    if l[0:2] != current_prefix:
        current_prefix = l[0:2]
    with open(os.path.join(output_prefix, f'{current_prefix}.csv'), 'a') as f:
        f.write(f'{l}\n')
