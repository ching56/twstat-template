# Dengue-Breeding-Source-Report

## Parse Script

### Python Setup

    pip3 install -r requirements.txt

### Key Setup

save as `.secret_key.json`

    {
        "dropbox_token": "XXX",
        "aws_key": "XXX",
        "aws_secret_key": "XXX"
    }

### Run

	python3 parse_oviposition_barrel.py

### Result

[data.json](https://s3.amazonaws.com/dengue-barrel/data.json)
