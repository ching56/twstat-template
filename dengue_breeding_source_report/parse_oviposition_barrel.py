import dropbox
import json
import mimetypes
import os
import requests
import sys
from boto.s3.connection import S3Connection
from boto.s3.key import Key
from pprint import pprint

# with open(".secret_key.json", "r") as myfile:
    # secrets = json.loads(myfile.read())

# def get_secret(setting, secrets=secrets):
    # try:
        # return secrets[setting]
    # except KeyError:
        # error_msg = "Set the {} enviroment variable".format(setting)
        # print (error_msg)
        # sys.exit(1)

# dropbox_token = get_secret('dropbox_token')
# aws_key = get_secret('aws_key')
# aws_secret_key = get_secret('aws_secret_key')

req = requests.get('https://docs.google.com/spreadsheets/d/1jApiM1FmngTFtww9PIhAf6Q-P6pacYNrFm2Nordz-gU/pub?gid=1505499599&single=true&output=tsv')
barrel_data = req.text.encode('latin1').decode('utf-8')

barrel_id_dict = dict()
for barrel_line in barrel_data.split('\r\n')[1:]:
    barrel_line_split = barrel_line.split('\t')
    barrel_id = barrel_line_split[1]
    is_open = barrel_line_split[6]
    if is_open != '是':
        continue

    barrel_dict = {
                "barrel_id": barrel_id,
                "lng": barrel_line_split[2],
                "lat": barrel_line_split[3],
                "address": barrel_line_split[4],
            }
    barrel_id_dict[barrel_id] = barrel_dict

req = requests.get('https://docs.google.com/spreadsheets/d/1Hi2Vyev6d6WbD1f8VtV0OMDz5v13gXmMjO8X414S5os/pub?gid=1500176822&single=true&output=tsv')
postive_negative_data = req.text.encode('latin1').decode('utf-8')

record_dict = dict()
# print (postive_negative_data)
for postive_negative_line in postive_negative_data.split('\r\n')[1:]:
    postive_negative_line_split = postive_negative_line.split('\t')
    barrel_id = postive_negative_line_split[1]
    date_str = postive_negative_line_split[2].replace('/', '-')
    date_record_dict = record_dict.get(date_str, dict())
    barrel_dict = barrel_id_dict.get(barrel_id, dict())
    if barrel_dict == dict():
        continue

    barrel_record_dict = {
                "barrel_id": barrel_id,
                "lng": barrel_dict["lng"],
                "lat": barrel_dict["lat"],
                "image_list": list(),
                "postive_negative": postive_negative_line_split[3],
                "postive_negative_notes": postive_negative_line_split[4]
            }
    date_record_dict[barrel_id] = barrel_record_dict
    record_dict[date_str] = date_record_dict

req = requests.get('https://docs.google.com/spreadsheets/d/1jUO9oyR34xaNRaUz_3CNpYm-08TzSCr412Ywy6T3hmI/pub?gid=2096104386&single=true&output=tsv')
egg_count_data = req.text.encode('latin1').decode('utf-8')

# print (egg_count_data)
for egg_count_line in egg_count_data.split('\r\n')[1:]:
    egg_count_line_split = egg_count_line.split('\t')
    egg_date_str = egg_count_line_split[0].split()[0].replace('/', '-')
    barrel_id = egg_count_line_split[1]
    date_str = egg_count_line_split[2].replace('/', '-')
    date_record_dict = record_dict.get(date_str, dict())
    barrel_record_dict = date_record_dict.get(barrel_id, dict())
    if barrel_record_dict == dict():
        continue

    barrel_record_dict['egg_date'] = egg_date_str
    barrel_record_dict['egg_count'] = egg_count_line_split[3]
    barrel_record_dict['egg_count_notes'] = egg_count_line_split[4]
    date_record_dict[barrel_id] = barrel_record_dict
    record_dict[date_str] = date_record_dict

req = requests.get('https://docs.google.com/spreadsheets/d/1ACijKInVmBC7BgTtcW-zNC3DmZ3wKyLV-RutITfcQEE/pub?gid=2040498971&single=true&output=tsv')
dengue_type_data = req.text.encode('latin1').decode('utf-8')

# print (dengue_type_data)
for dengue_type_line in dengue_type_data.split('\r\n')[1:]:
    dengue_type_line_split = dengue_type_line.split('\t')
    dengue_date_str = dengue_type_line_split[0].split()[0].replace('/', '-')
    barrel_id = dengue_type_line_split[1]
    date_str = dengue_type_line_split[2].replace('/', '-')
    date_record_dict = record_dict.get(date_str, dict())
    barrel_record_dict = date_record_dict.get(barrel_id, dict())
    if barrel_record_dict == dict():
        continue

    barrel_record_dict['dengue_date'] = dengue_date_str
    barrel_record_dict['dengue_type'] = dengue_type_line_split[3]
    barrel_record_dict['dengue_type_notes'] = dengue_type_line_split[4]
    date_record_dict[barrel_id] = barrel_record_dict
    record_dict[date_str] = date_record_dict


# conn = S3Connection(aws_key, aws_secret_key)
# bucket = conn.get_bucket('dengue-barrel')
# s3_photo_name_list = list()
# for key in bucket.list():
    # s3_photo_name_list.append(key.name)


# dbx = dropbox.Dropbox(dropbox_token)
# for entry in dbx.files_list_folder('/dengue-barrel').entries:
    # file_name = entry.name
    # file_name_split = file_name.split('_')
    # file_date_str_split = file_name_split[0].split('-')
    # file_date_str_split = [str(int(date_str_split)) for date_str_split in file_date_str_split]
    # file_date_str = "-".join(file_date_str_split)
    # file_name = "%s_%s_%s" % (file_date_str, file_name_split[1], file_name_split[2])
    # if file_name in s3_photo_name_list:
        # continue

    # s3_photo_name_list.append(file_name)
    # file_content = dbx.files_download(entry.path_lower)[1].content
    # file_mime = mimetypes.guess_type(file_name)[0]
    # k = Key(bucket)
    # k.key = '%s' % (file_name)
    # k.set_metadata("Content-Type", file_mime)
    # k.set_contents_from_string(file_content)
    # k.set_acl('public-read')

# for s3_photo_name in s3_photo_name_list:
    # if s3_photo_name == 'data.json':
        # continue
    # s3_photo_name_split = s3_photo_name.split('_')
    # date_str = s3_photo_name_split[0]
    # barrel_id = s3_photo_name_split[1]
    # date_record_dict = record_dict.get(date_str, dict())
    # barrel_record_dict = date_record_dict.get(barrel_id, dict())
    # if barrel_record_dict == dict():
        # continue

    # record_img_list = barrel_record_dict.get('image_list', list())
    # record_img_list.append("https://s3.amazonaws.com/dengue-barrel/%s" % (s3_photo_name))
    # barrel_record_dict['image_list'] = record_img_list
    # date_record_dict[barrel_id] = barrel_record_dict
    # record_dict[date_str] = date_record_dict

# output_dict = dict()
# for date_str in record_dict.keys():
    # barrel_id_list = list(record_dict[date_str].keys())
    # barrel_id_list = [int(barrel_id) for barrel_id in barrel_id_list]
    # barrel_id_list.sort()
    # barrel_list = list()
    # for barrel_id in barrel_id_list:
        # barrel_list.append(record_dict[date_str][str(barrel_id)])
    # output_dict[date_str] = {
                # "barrel_list": barrel_list
            # }

# k = Key(bucket)
# k.key = 'data.json'
# k.set_metadata("Content-Type", 'application/json')
# k.set_contents_from_string(json.dumps(output_dict))
# k.set_acl('public-read')
# pprint (output_dict)
