# -*- coding: utf-8 -*-
import urllib2
import simplejson as json
import os, sys, re
import sqlite3
import datetime

db = sqlite3.connect(':memory:')
db.text_factory = str

def put():
	for i in [1]:
		response = urllib2.urlopen('http://m.ppomppu.co.kr/new/bbs_list.php?id=ppomppu2&page='+str(i))
		parse(response)

def parse(data):
	for line in data:
		if "href='bbs_view.php?id=" in line:
			m = re.findall(r"bbs_view.php\?id=ppomppu2&no=(\d+)&|<strong>(.*?)</strong>|<span[^>]*>(.*?)</span>", line)
			l = refine(m)
			# print '##>' + ','.join(l)
			insert(l)
	db.commit()

def refine(m):
	ret = []
	for i in m:
		# print i
		for a in i:
			# print a
			if a is not '':
				ret.append(a)
	return ret

def insert(line):
	cursor = db.cursor()
	id = str(line[0])
	if idExists(id):
		update(line)
	else:
		print ", ".join(line)
		title = str(line[1])
		title = unicode(title,  "euc-kr").encode("utf-8", "ignore")
		writer = str(line[3])
		writer = unicode(writer,  "euc-kr").encode("utf-8", "ignore")
		replycnt = str(line[2])
		replycnt = re.sub(r"\[|\]|\/", "", replycnt)
		replycnt = replycnt.strip()
		try:
			viewcnt = str(line[5])
			viewcnt = re.sub(r"\[|\]|\/", "", viewcnt)
			viewcnt = viewcnt.split(" ")[1]
			viewcnt = viewcnt.strip()
		except IndexError as idx:
			# viewcnt = '0'
			pass

		date = str(line[4])
		now = datetime.datetime.now()

		try:

			cursor.execute('''
				INSERT INTO ppompu2(id, title, writer, replycnt, viewcnt, date, ts, viewspeed)
		    VALUES(?,?,?,?,?,?)''', (int(id), title, writer, int(replycnt), int(viewcnt), date, now, 0 )
		    )
		except ValueError as e:
			pass


def update(line):
	curosr = db.curosr()
	curosr.execute(""" select * from ppompu2 where id = """+id)
	row = curosr.fetchone()


def idExists(id):
	cursor = db.cursor()
	cursor.execute(""" select count(*) from ppompu2 where id = """+id)
	row = cursor.fetchone()
	if len(row) > 0:
		return True
	else
		return False

def drop_table():
	cursor = db.cursor()
	cursor.execute('''
		DROP TABLE IF EXISTS ppompu2
		''')
	db.commit()

def create_table():
	cursor = db.cursor()
	cursor.execute('''
    CREATE TABLE IF NOT EXISTS ppompu2(id INTEGER, title VARCHAR(100), writer VARCHAR(100),
                       replycnt INTEGER, viewcnt INTEGER, date VARCHAR(50) , ts timestamp, viewspeed int)
	''')
	db.commit()


def get():
	cursor = db.cursor()
	cursor.execute(""" select * from ppompu2 """)
	all_rows = cursor.fetchall()
	for row in all_rows:
		print('{0} : {1} : {2} : {3} : {4} : {5}'.format(row[0], row[1], row[2], row[3], row[4], row[5]))

if __name__ == '__main__':
	drop_table()
	create_table()
	put()
	print '-----------------------'
	get()
