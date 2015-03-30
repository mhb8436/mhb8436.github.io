# -*- coding: utf-8 -*-
import csv
import sys
import re
import urllib
import urllib2
# import simplejson as json
import json
import gzip
from StringIO import StringIO
import sqlite3
import datetime
import xlrd

def main():
	book = xlrd.open_workbook('APT_142.xls')
	# print book.nsheets
	# print book.sheet_names()
	firstsheet = book.sheet_by_index(0)
	# fs =  firstsheet.row_values(1)
	num_rows = firstsheet.nrows - 1
	cur_row = 0
	while cur_row < num_rows:
		cur_row += 1
		row = firstsheet.row_values(cur_row)
		insert('201201', row)
	conn.commit()	
	select('201201')	
	# print fs 	
	# insert('201201', fs)
	# select('201201')
	# for f in fs:
	# 	# print f.encode('utf-8')		
	# 	try:
	# 		print f.encode('utf-8')
	# 	except:
	# 		print f

def select(cym):
	selsql = "select * from real_estate where cym = '"+cym+"'"
	cursor = conn.execute(selsql)	
	for row in cursor:
		print row

def insert(cym, p):
	# print p.encode('utf-8')
	print p
	chkvalue = 0
	countsql = "SELECT count(id)  from real_estate where cym = '"+cym+"' and  state='"+p[0]+"' and  mainno="+str(int(p[1]))+"  \
		and subno="+str(int(p[2]))+" and apt='"+p[3]+"' and area="+str(int(p[4]))+" and stair='"+p[6]+"'"
	# print countsql.encode('utf-8')
	try:
		cursor = conn.execute(countsql)
		for row in cursor:
			chkvalue = row[0]
	except:
		print countsql

	if chkvalue == 0:	
		inssql = "INSERT INTO real_estate (cym, state,mainno,subno, apt ,area, tamount, cdate, stair, birth, stname) \
		    VALUES ('"+cym+"', '"+p[0]+"',"+str(int(p[1]))+","+str(int(p[2]))+", '"+p[3]+"' ,"+str(float(p[4]))+", '"+p[5]+"', '"+p[6]+"', "+str(int(p[7]))+", "+str(int(p[8]))+", '"+p[9]+"')"
		# print inssql.encode('utf-8')
		try:
			conn.execute(inssql)
		except:
			print inssql	
	
if __name__ == '__main__':
	conn=sqlite3.connect('bb.db')
	print "Opened database successfully";
	# conn.execute('''drop table real_estate ''')
	conn.commit()
	conn.execute('''CREATE TABLE  IF NOT EXISTS real_estate
       ( id INTEGER PRIMARY KEY   AUTOINCREMENT,
       cym char(6) not null, 
       state text     NOT NULL,
       mainno           INT    NOT NULL,
       subno           INT     NOT NULL,
       apt        CHAR(100) NOT NULL,
       area         REAL,
       cdate        CHAR(50),
       tamount      int ,
       stair int ,
       birth int ,
       stname text
       );''')

	main()

# 시군구 state
# 본번 mainno
# 부번 subno
# 단지명 apt
# 전용면적(m2) area
# 계약일 cdate
# 거래금액(만원)
# 층
# 건축년도
# 도로명주소


# 서울특별시 강남구 개포동
# 12.0
# 0.0
# 대청
# 39.53
# 11~20
# 24,900
# 14
# 1992.0
# 개포로109길