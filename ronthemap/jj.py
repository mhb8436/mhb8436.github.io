# -*- coding: utf-8 -*-
import sys
reload(sys)
sys.setdefaultencoding('utf-8')
import re, psycopg2, csv
import datetime
import codecs,json

def query_result(sqlstr):	
	aaa = []
	try:
		cur = conn.cursor()
		cur.execute(sqlstr)
		rows = cur.fetchall()	
		for row in rows:
			aaa.append(row)
	except Exception as e:
		print e, sqlstr
	return aaa


def make_json(nm, arr):
	with codecs.open(nm, 'w', encoding='utf-8') as f:
		json.dump(arr, f, indent=4, sort_keys=True, ensure_ascii=False)


if __name__ == '__main__':
	try:
		conn = psycopg2.connect("dbname='airplug' user='airplug' host='localhost' password='airplug'")
		conn.set_isolation_level(0)
	except:
		print "Error while connecting to database"
	print "Opened database successfully";

	make_json('jj01.json', query_result(""" select row_to_json(t) from (
select state||' '||mainno||' '||subno||' '||apt as ttt, count(1) as cnt 
from real_estate_apt_buy where cym between '20130101' and '20131201'
and state like '%서울특별시 양천구%'
group by state||' '||mainno||' '||subno||' '||apt order by 2 desc
) t  """))

