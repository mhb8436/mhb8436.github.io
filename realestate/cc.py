# -*- coding: utf-8 -*-
import csv
import sys
import re
import urllib
import urllib2
import json
import gzip
from StringIO import StringIO
import datetime
import xlrd
import psycopg2


def main():
	fname = '201106_APT_210.xls'
	book = xlrd.open_workbook(fname)
	firstsheet = book.sheet_by_index(0)
	num_rows = firstsheet.nrows - 1
	cur_row = 0
	while cur_row < num_rows:
		cur_row += 1
		row = firstsheet.row_values(cur_row)
		insert(fname.split('_')[0], row)
	conn.commit()	
	select(fname.split('_')[0])	

def select(cym):
	selsql = "select * from real_estate where cym = '"+cym+"'"
	cur = conn.cursor()
	cursor = cur.execute(selsql)	
	rows = cur.fetchall()
	for row in rows:
		print row

def insert(cym, p):
	# print p.encode('utf-8')
	# print p
	chkvalue = 0
	countsql = "SELECT count(id)  from real_estate where cym = '"+cym+"' and  state='"+p[0]+"' and  mainno="+str(int(p[1]))+"  \
		and subno="+str(int(p[2]))+" and apt='"+p[3]+"' and area="+str(int(p[4]))+" and stair='"+p[6].replace(',','')+"'"
	cur = conn.cursor()
	# print countsql.encode('utf-8')
	try:
		cursor = cur.execute(countsql)
		rows = cur.fetchall()
		for row in rows:
			chkvalue = row[0]
	except Exception as err:
		print 'select query is %s and err is %s'%(countsql.encode('utf-8'), err)
	print chkvalue	
	conn.commit()
	if chkvalue == 0:	
		inssql = "INSERT INTO real_estate (cym, state,mainno,subno, apt ,area,  cdate, tamount, stair, birth, stname) \
		    VALUES ('"+cym+"', '"+p[0]+"',"+str(int(p[1]))+","+str(int(p[2]))+", '"+p[3]+"' ,"+str(float(p[4]))+", '"+p[5]+"', '"+p[6].replace(',','')+"', "+str(int(p[7]))+", "+str(int(p[8]))+", '"+p[9]+"')"
		# print inssql.encode('utf-8')
		try:
			# cur = conn.cursor()
			cur.execute(inssql)
			# conn.commit()
		except Exception as err:
			print 'insert err %s'%err
			# print err
	
if __name__ == '__main__':
	# try:
	conn = psycopg2.connect("dbname='testdb' user='daebak' host='localhost' password='1q2w3e4r'")
	conn.autocommit=True
	# except:
	# 	print "Error while open database"	
	# conn=sqlite3.connect('bb.db')
	print "Opened database successfully"
	# conn.execute('''drop table real_estate ''')
	# conn.commit()
	cur = conn.cursor()
	cur.execute('''CREATE TABLE  IF NOT EXISTS real_estate
       ( id SERIAL PRIMARY KEY  ,
       cym VARCHAR(10) not null, 
       state text     NOT NULL,
       mainno           INT    NOT NULL,
       subno           INT     NOT NULL,
       apt        VARCHAR(200) NOT NULL,
       area         REAL,
       cdate        VARCHAR(100),
       tamount      int ,
       stair int ,
       birth int ,
       stname text
       );''')
	# conn.commit()
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