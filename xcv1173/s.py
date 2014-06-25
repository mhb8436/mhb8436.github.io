#-*- coding: utf-8 -*-
from urllib import urlencode
import simplejson as json
import csv
import sys
import re
import urllib
import urllib2
# import simplejson as json
import json
import gzip
from StringIO import StringIO
import base64
import codecs

def readUrl2(url):
	opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
	urllib2.install_opener(opener)
	opener.addheaders = [
		 ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
		,('accept-encoding','gzip,deflate,sdch')
		,('accept-language','en-US,en;q=0.8,ko;q=0.6')
		,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36')
	]
	google_res = opener.open(url)
	print google_res.info().get('Content-Encoding')
	if google_res.info().get('Content-Encoding') == 'gzip':
		buf = StringIO( google_res.read() )
		f = gzip.GzipFile(fileobj=buf)
		content = f.read()

		# dataus = re.findall(r'<a class="en[a-zA-Z0-9\_\s]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
		dataus = re.findall(r'<div class="[a-zA-Z0-9\_\s\-]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
		names = re.findall(r'<span class="name">[^\<\>]*</span>',content, re.M|re.I)
		images = re.findall(r'<img src="http://[^\<]*',content, re.M|re.I)
		b = re.search(r'<div b=".*" id="jkr"', content, re.M|re.I)

		result = []	
		print str(len(dataus)) + ':' + str(len(names)) + ':' + str(len(images))
		if dataus and names and images:
			for i, d in enumerate(dataus):
				# print images[i]			 unicode(writer,  "euc-kr").encode("utf-8", "ignore")
				try:
					nm= extcont(names[i])
					print nm
					result.append({'url':decodeUrl(extattr(b.group()), extattr(dataus[i])), 'name':nm.decode('utf-8'), 'image':extattr(images[i])  })
				except IndexError:
					pass

		return result

def nhnImgUrl():
	url = 'http://image.search.naver.com/search.naver?where=image&sm=tab_jum&ie=utf8&query=%ED%9E%88%EC%96%B4%EB%A1%9C%EC%A6%88+%EB%AF%B8%EB%93%9C+%EC%9D%B4%EB%AF%B8%EC%A7%80'
	opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
	urllib2.install_opener(opener)
	
	opener.addheaders = [
		 ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
		,('accept-encoding','gzip,deflate,sdch')
		,('accept-language','en-US,en;q=0.8,ko;q=0.6')
		,('Cache-Control','max-age=0')
		,('Connection','keep-alive')
		,('Cookie','NNB=XUJD6C54DNDFE; npic=EXrsp7gmY44+BZsTrgtkrPUB04GxImrzgZ6Km6JasZMtzakgZW5qmnbIy02LuEDuCA==; page_uid=RHrDlspySDdssZSSWDZsss--325184; _naver_usersession_=U5rldnHAmVMAADKUql0; BMR=')
		,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36')
	]
	google_res = opener.open(url)
	print google_res.info().get('Content-Encoding')
	if google_res.info().get('Content-Encoding') == 'gzip':
		buf = StringIO( google_res.read() )
		f = gzip.GzipFile(fileobj=buf)
		content = f.read()

		# dataus = re.findall(r'<a class="en[a-zA-Z0-9\_\s]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
		dataus = re.search(r'oLoadImageSource[\s]*\=(\s)*\{(\s)*img1[^\,]*', content, re.M|re.I)
		if dataus:
			d1 = dataus.group()
			d2 = re.search(r'"(.*)', d1, re.M|re.I)
			d3 = d2.group()
			d3 = d3[1:len(d3)-1]
			return d3


def nhnUrl(url):
  url = 'http://m.search.naver.com/search.naver?where=nexearch&query=%EB%AF%B8%EA%B5%AD+%EB%93%9C%EB%9D%BC%EB%A7%88&sm=top_hty&fbm=1&ie=utf8'
  opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
  urllib2.install_opener(opener)
  rrrr = []
  opener.addheaders = [
     ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
    ,('accept-encoding','gzip,deflate,sdch')
    ,('accept-language','en-US,en;q=0.8,ko;q=0.6')
    ,('Cache-Control','max-age=0')
    ,('Connection','keep-alive')
    ,('Cookie','NNB=XUJD6C54DNDFE; npic=EXrsp7gmY44+BZsTrgtkrPUB04GxImrzgZ6Km6JasZMtzakgZW5qmnbIy02LuEDuCA==; page_uid=RHrDlspySDdssZSSWDZsss--325184; _naver_usersession_=U5rldnHAmVMAADKUql0; BMR=')
    ,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36')
  ]
  google_res = opener.open(url)
  # print google_res.info().get('Content-Encoding')
  if google_res.info().get('Content-Encoding') == 'gzip':
    buf = StringIO( google_res.read() )
    f = gzip.GzipFile(fileobj=buf)
    content = f.read()

    # dataus = re.findall(r'<a class="en[a-zA-Z0-9\_\s]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
    dataus = re.search(r'var batchDataList=\[\{(.*)\;</script>', content, re.M|re.I)
    # print dataus
    if dataus:
      d1 = dataus.group()
      d2 = re.search(r'=\[(.*);', d1, re.M|re.I)
      d3 = d2.group()
      d3 = d3[1:len(d3)-1]

      d3 = json.loads(d3);
      # print d3
      # now d3 is object 
      for d in d3:
        # print d
#         (([시즌])+\d|)*
# [(\s)(\d)*(\s)*]
		istr = 'http://tv03.search.naver.net/nhnsvc?size=42x60&q=http://sstatic.naver.net/keypage/image/dss/'+d['posterImgUrl'] 
		name = d['broadcastName']

		name = re.sub(r'시즌', '', name.encode('utf-8','ignore'))
		name = re.sub(r'((\s)+(\d))*', '', name)
		# print name
		rrrr.append(name)
	
      return rrrr
        # nn = re.findall(r'([^시즌]\d)*',name, re.M|re.I)
        # nstr = ''.join(nn)
		# print d['broadcastName'].encode('utf-8','ignore') + '---' + name.encode('utf-8','ignore')
 

def gRankUrl(url):
	opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
	urllib2.install_opener(opener)
	
	opener.addheaders = [
		 ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
		,('accept-encoding','gzip,deflate,sdch')
		,('accept-language','en-US,en;q=0.8,ko;q=0.6')
		,('Cache-Control','max-age=0')
		,('Connection','keep-alive')
		,('Cookie','NNB=XUJD6C54DNDFE; npic=EXrsp7gmY44+BZsTrgtkrPUB04GxImrzgZ6Km6JasZMtzakgZW5qmnbIy02LuEDuCA==; page_uid=RHrDlspySDdssZSSWDZsss--325184; _naver_usersession_=U5rldnHAmVMAADKUql0; BMR=')
		,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36')
	]
	google_res = opener.open(url)
	print google_res.info().get('Content-Encoding')
	if google_res.info().get('Content-Encoding') == 'gzip':
		buf = StringIO( google_res.read() )
		f = gzip.GzipFile(fileobj=buf)
		content = f.read()

		# dataus = re.findall(r'<a class="en[a-zA-Z0-9\_\s]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
		dataus = re.search(r'<div id="resultStats">About(\s)*[\d\,]*', content, re.M|re.I)
		if dataus:
			d1 = dataus.group()
			print d1
			d2 = re.findall(r'[(\d)\,]*', d1, re.M|re.I)
			# print d2
			# d3 = d2.group()
			print ''.join(d2)
			d3 = int(''.join(d2).replace(',',''))
			print str(d3)


	return d3


def readUrl(url):
	# f = codecs.open(url, "r", "utf-8")

	# content = f.read()
	opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
	urllib2.install_opener(opener)
	opener.addheaders = [
		 ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
		,('accept-encoding','gzip,deflate,sdch')
		,('accept-language','en-US,en;q=0.8,ko;q=0.6')
		,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36')
	]

	google_res = opener.open(url)
	# print google_res.info().get('Content-Encoding')
	if google_res.info().get('Content-Encoding') == 'gzip':
		buf = StringIO( google_res.read() )
		f = gzip.GzipFile(fileobj=buf)
		content = f.read()
		# print content
		contents = re.search(r'미드(.*)</h5>(.*)', content, re.M|re.I)
		# print " --------- contents --------"
		# print contents.group()
		# dataus = re.findall(r'<a class="en[a-zA-Z0-9\_\s]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
		dataus = re.findall(r'<a class="[a-zA-Z0-9\_\s\-]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
		names = re.findall(r'<span class="name">[^\<\>]*</span>',content, re.M|re.I)
		images = re.findall(r'<img src="http://[^\<]*',content, re.M|re.I)
		b = re.search(r'<div b=".*" id="jkr"', content, re.M|re.I)

		result = []	
		# print str(len(dataus)) + ':' + str(len(names)) + ':' + str(len(images))
		if dataus and names and images:
			for i, d in enumerate(dataus):
				# print images[i]			 unicode(writer,  "euc-kr").encode("utf-8", "ignore")
				try:
					nm= extcont(names[i])
					# print nm
					result.append({'url':decodeUrl(extattr(b.group()), extattr(dataus[i])), 'name':nm.decode('utf-8'), 'image':extattr(images[i])  })
				except IndexError:
					pass

		return result

def extattr(str):
	a = re.search(r'"[a-zA-Z0-9\=\/\:\.\_\,]{3,}"', str, re.M|re.I)
	if a:
		return a.group().replace('"','').replace('>','').replace('<','')

def extcont(str):
	a = re.search(r'>.*<', str, re.M|re.I)
	if a:
		return a.group().replace('"','').replace('>','').replace('<','')


def decodeUrl(e, t):
	_e = re.sub(r'[A-Z]', "", e)  
	e1 = list(_e)
	t1 = list(t)
	r = []
	for t_ in t1:
		if t_ in e1:
			r.append(e1[int(t_, 36)])
		else:
			r.append(t_)
	return base64.b64decode(''.join(r))

def initialBatch():

	url = 'http://xcv1173.appspot.com/ewdfosid71'
	# result = urlfetch.fetch(url)
	result = urllib2.urlopen(url)
	lll = json.loads(result.read())
	for o in lll:
		url = 'http://xcv1173.appspot.com/tasks/durtka18?q=' + urllib.quote(o['name'].encode('utf-8'))
		result2 = urllib2.urlopen(url)


def checkfromfile():
	with open('mid.list') as f:
		content = f.readlines()
		for c in content:
			aa = readUrl('http://searchpang.com/finder?q='+urllib.quote(c.strip())+'&search_tags%5B%5D='+urllib.quote("미드") )
			print c.strip() + ' = ' + str(len(aa))

def addmoviefromfile():
	# result = urlfetch.fetch(url)
	with open('mid.list2') as f:
		content = f.readlines()
		for c in content:
			print c.strip()
			# url = 'http://xcv1173.appspot.com/tasks/ewdfosid62?q=' + c.strip())
			url = 'http://localhost:8080/ewdfosid93?q=' + urllib.quote(c.strip())
			result2 = urllib2.urlopen(url)

	url = 'http://localhost:8080/ewdfosid21'		
	result2 = urllib2.urlopen(url)

def checkInt(ddd):
	print ddd
	a = re.search(r'[\d]+', ddd, re.M|re.I)
	if a:
		print 'True'
	else:
		print 'False'


def updatetitlefromnhn(titles):
	print 'updatetitlefromnhn(titles)-- started!'
	url = 'http://xcv1173.appspot.com/ewdfosid71'
	result = urllib2.urlopen(url)
	aaa = result.read()
	# print aaa
	lll = json.loads(result.read())
	for o in lll:
		for t in titles:
			if  t.replace(' ','') in o['name'].encode('utf-8').replace(' ',''):
				print t

if __name__ == '__main__':
	e = 'ZZXEBTCGBofxkudjlcrt0q45gs291m8znw6viebp7hy3aBEGGPONIUYHV'
	t = 'zHRb8D0qLyN7YXJ6zHBwtk84YhiaLyAq8xlbNhN98X72LyNb8kVwtQ=='
	# print decodeUrl(e, t)
	# result = nhnImgUrl()
	# result = gRankUrl('https://www.google.co.kr/search?q=%EC%99%95%EC%A2%8C%EC%9D%98+%EA%B2%8C%EC%9E%84&oq=%EC%99%95%EC%A2%8C%EC%9D%98+%EA%B2%8C%EC%9E%84')
	result = nhnUrl('http://m.search.naver.com/search.naver?where=nexearch&query=%EB%AF%B8%EA%B5%AD+%EB%93%9C%EB%9D%BC%EB%A7%88&sm=top_hty&fbm=1&ie=utf8')
	updatetitlefromnhn(result)
	# result = readUrl('http://searchpang.com/finder?q='+urllib.quote("왕좌의 게임")+'&search_tags%5B%5D='+urllib.quote("미드") )
	# result = readUrl2('http://mentplus.com/m/v/2cxi58k' )
	# for r in result:
	# 	r['details'] = readUrl(r['url'])
	# for r in result:
	# 	print r['name'].encode('utf-8')
	# result = '시즌'

	# initialBatch()
	# checkfromfile()
	# addmoviefromfile()
	# checkInt('123')


	