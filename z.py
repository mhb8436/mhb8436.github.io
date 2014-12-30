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


def get_data_from_url(url):
	opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
	urllib2.install_opener(opener)
	opener.addheaders = [
		 ('Accept','text/plain, */*; q=0.01')
		,('Accept-encoding','gzip, deflate, sdch')
		,('Accept-language','ko-KR,ko;q=0.8,en-US;q=0.6,en;q=0.4')
		,('Referer',url)
		,('Cookie', 'PHPSESSID=a4a130a2d7812596e0fa29a7b248578f;')
		,('X-Requested-With', 'XMLHttpRequest')
		,('Connection','keep-alive')
		,('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36')
	]
	try:
		res = opener.open(url)
		if res.info().get('Content-Encoding') == 'gzip':
			buf = StringIO( res.read() )
			f = gzip.GzipFile(fileobj=buf)
			data = f.read()
			return data
	except:
		pass

def parse_category(content):
	data = re.findall(r'<section class="list">[\s\r\n]*<ul>[\s\w\"\n\r\=\<\>\/\W]*</ul>[\s\r\n]*</section>', content, re.M|re.I)
	for i, d in enumerate(data):
		try:
			title = re.findall(r'(?<=<div class="txt">)[\W+]*(?=</div>)', d, re.M|re.I)
			for j, t in enumerate(title):
				print t
			url = re.findall(r'(?<=href=")[\w\s\d\/]*', d, re.M|re.I)
			for j, u in enumerate(url):
				print u
		except IndexError:
			pass 

def parse_epi_from_channel(content):
	print content
	seq = re.findall(r'<dd>&nbsp;(.+).</dd>', content, re.M|re.I)
	title = re.findall(r'<dd class="tit">(.+)</dd>', content, re.M|re.I)
	url = re.findall(r'<a class="view" href="(.+)">', content, re.M|re.I)
	date = re.findall(r'<dd class="date">(.+)</dd>', content, re.M|re.I)
	for s,t,u,d in zip(seq, title, url, date):
		try:
			print s + '-' + t + '-' + u + '-' + d
 		except IndexError:
			pass 

def parse_pod_from_category(content):
	print content

if __name__ == '__main__':
	# parse_category(get_data_from_url("http://m.podbbang.com/category")) # parse category
	# parse_pod_from_category(get_data_from_url("http://m.podbbang.com/category/lists/0/1"))
<<<<<<< HEAD
	parse_epi_from_channel(get_data_from_url("http://m.podbbang.com/ch/lists/4362/1"))
=======
	parse_epi_from_channel(get_data_from_url("http://m.podbbang.com/ch/lists/4362/1"))

>>>>>>> a4b4404cd85157c9dd8ce30ad0a0472bf63a734e
