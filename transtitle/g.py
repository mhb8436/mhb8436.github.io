#-*- coding: utf-8 -*-
from urllib import urlencode
import simplejson as json
import csv
import sys
import re, os
import urllib
import urllib2
# import simplejson as json
import json
import gzip
from StringIO import StringIO
import base64
import codecs


def trans(q):
	url = "https://translate.google.com/translate_a/single?client=t&sl=en&tl=ko&hl=ko&dt=bd&dt=ex&dt=ld&dt=md&dt=qc&dt=rw&dt=rm&dt=ss&dt=t&dt=at&dt=sw&ie=UTF-8&oe=UTF-8&pc=1&oc=1&otf=1&ssel=0&tsel=0&q=#q#"
	url = url.replace('#q#', urllib.quote(q))
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
	# print google_res.info().get('Content-Encoding')
	try:

		if google_res.info().get('Content-Encoding') == 'gzip':
			buf = StringIO( google_res.read() )
			f = gzip.GzipFile(fileobj=buf)
			content = f.read()
			content = content.replace(",,",",").replace(",,",",").replace(",,",",")
			lll = json.loads(content)
			print lll[0][0][0].encode('utf-8')
			return lll[0][0][0].encode('utf-8')
	except:
		return ""



if __name__ == '__main__':
	# q = "i love you"
	rfilenm = 'Game.of.Thrones.S01E08.720p.HDTV.ReEnc-Max.srt'
	wfilenm = 'Game.of.Thrones.S01E08.720p.HDTV.ReEnc-Max2.srt'
	scene = False
	ss = []
	rf = open(rfilenm, 'rw')
	wf = open(wfilenm, 'w')
	for x in  rf.readlines():
		x = x.strip()
		# print x
		# print x + ':' + str(isinstance(x, (int, long, float, complex)))
		if x.isdigit():
			# scene = True
			wf.write(x + os.linesep)
		elif '-->' in x:
			# scene = True
			wf.write(x + os.linesep)
		elif len(x) < 1:
			aa = trans(' '.join(ss))
			if aa:
				wf.write(aa + os.linesep + os.linesep) 
			ss = []
		else:
			print x
			ss.append(x)

	wf.close()
	rf.close()

	# trans(q)