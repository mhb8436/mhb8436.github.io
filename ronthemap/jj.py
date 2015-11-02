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
		json.dump(arr, f, indent=1, sort_keys=True, ensure_ascii=False)


if __name__ == '__main__':
	try:
		conn = psycopg2.connect("dbname='airplug' user='airplug' host='localhost' password='airplug'")
		conn.set_isolation_level(0)
	except:
		print "Error while connecting to database"
	print "Opened database successfully";

	make_json('jj01.json', query_result(""" select row_to_json(t) from (
select x.aptnm, x.ymd, a.lat, a.lng, x.cnt from (
select b.state||' '||b.mainno||' '||b.subno||' '||b.apt as aptnm, b.cym as ymd, min(b.state) as state, min(b.mainno) as mainno, min(b.subno) as subno, min(apt) as apt, count(1) as cnt 
from real_estate_apt_buy b 
where b.cym between '20121201' and '20141201'
group by b.state||' '||b.mainno||' '||b.subno||' '||b.apt, b.cym
) x left join (select distinct state||' '||mainno||' '||subno||' '||apt, state, mainno,subno,apt,lat,lng from real_estate_addr) a on x.state=a.state and x.mainno=a.mainno and x.subno=a.subno and x.apt=a.apt order by x.ymd, x.cnt desc
) t  """))

