# -*- coding: utf-8 -*-
import urllib2
import simplejson as json
import os, sys, re
import sqlite3
import datetime
import time

db = sqlite3.connect('ppompu2.db')
db.text_factory = str

filters = ['iphone','5S', '아이폰', 'IPhone']


def put():
	for i in [1,2,3,4,5]:
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
	# print 'insert=================='
	cursor = db.cursor()
	id = str(line[0])
	# print ", ".join(line)
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

	if idExists(id):
		update(id, title, writer, viewcnt, replycnt)
	else:

		date = str(line[4])
		now = time.time()

		try:
			cursor.execute('''
				INSERT INTO ppompu2(id, title, writer, replycnt, viewcnt, date, ts, viewspeed, replyspeed)
		    VALUES(?,?,?,?,?,?,?,?,?)''', (int(id), title, writer, int(replycnt), int(viewcnt), date, now, 0 ,0 )
		    )
		except ValueError as e:
			# print e
			pass


def update(id, title, writer, viewcnt, replycnt):
	cursor = db.cursor()
	# now = datetime.datetime.now()
	try:
		print id + "|" + title + "|" + writer + "|" + viewcnt + "|" + replycnt 
		one = findById(id)
		now = time.time()
		# print now + ":" + one[6]
		viewspeed = (int(viewcnt) - int(one[2]))/(float(now) - float(one[6]))*60
		replyspeed = (int(replycnt) - int(one[3]))/(float(now) - float(one[6]))*60

		print 'speed is ' + str(viewspeed) + ":" + str(replyspeed)
		cursor.execute("""
			update ppompu2 set 
			viewspeed = ?
			, replyspeed = ?
			where id = ? """, (int(viewspeed), int(replyspeed), int(id) )
			)
		
	except (IndexError, ValueError) as e:
		# print 'lines is %s , %s , %s'%(viewcnt,replycnt,id) 
		pass
	
def idExists(id):
	cursor = db.cursor()
	cursor.execute(""" select count(*) from ppompu2 where id = """+id)
	row = cursor.fetchone()
	if row[0] > 0:
		return True
	else:
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
                       replycnt INTEGER, viewcnt INTEGER, date VARCHAR(50) , ts timestamp, viewspeed REAL, replyspeed REAL)
	''')
	db.commit()

def findById(id):
	cursor = db.cursor()
	cursor.execute(""" select id, title, viewcnt, replycnt, viewspeed, replyspeed, ts from ppompu2 where id = """+id)
	row = cursor.fetchone()
	print('{0} : {1} : {2} : {3} : {4} : {5} : {6}'.format(row[0], row[1], row[2], row[3], row[4], row[5], row[6]))
	return row


def get():
	cursor = db.cursor()
	cursor.execute(""" select id, title, viewcnt, replycnt, viewspeed, replyspeed from ppompu2 where replyspeed > 1""")
	all_rows = cursor.fetchall()
	for row in all_rows:
		print('{0} : {1} : {2} : {3} : {4} : {5}'.format(row[0], row[1], row[2], row[3], row[4], row[5]))


def findByFilter():
	cursor = db.cursor()	
	for f in filters:
		cursor.execute(""" select id, title, viewcnt, replycnt, viewspeed, replyspeed from ppompu2 
			where title like '%"""+f+"""%' """)
		rows = cursor.fetchall()
		for row in rows:
			print('{0} : {1} : {2} : {3} : {4} : {5}'.format(row[0], row[1], row[2], row[3], row[4], row[5]))


if __name__ == '__main__':
	# drop_table()
	create_table()
	put()
	print '-----------------------'
	get()
	print '-----------------------'
	findByFilter()



