#-*- coding: utf-8 -*-
from urllib import urlencode
import simplejson as json
import csv
import sys, time
import re
import urllib
import urllib2
# import simplejson as json
import json
import gzip
from StringIO import StringIO
import base64
import codecs
from random import randint

def gRankUrl(q):
	urls = ['https://www.google.co.kr/webhp?tab=ww&ei=K0eiU_GANtaMuASuloCYBQ&ved=0CBMQ1S4&gfe_rd=cr#newwindow=1&q=#q#','https://www.google.com/search?q=#q#', 'https://www.google.co.kr/search?q=#q#&gws_rd=ssl', 'https://www.google.co.kr/search?q=#q#']
	q = '"' +q +'"' + ' "미국드라마"'
	# url = 'http://www.google.com/search?q=' + urllib.quote(q)
	url = urls[randint(0,len(urls)-1)]
	url = url.replace('#q#', urllib.quote(q))

	print url
	opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
	urllib2.install_opener(opener)
	cokis = ['PREF=ID=dd22a8aa2166d5e7:U=e67eb7783f27df89:FF=0:LD=en:NW=1:TM=1377477408:LM=1403063118:S=16F2ZQCF1jYirKva; GOOGLE_ABUSE_EXEMPTION=ID=d869b6d71438972a:TM=1403141300:C=c:IP=14.52.145.61-:S=APGng0uQLPcePr71sKL_EhxVU0dd-DWZQw; NID=67=j_yxTQLw_v5OjcC4m6UJrS5VoDmpz3JPBkb3B_pAmddqisOuFr5SJhMEZgrFOky15lpQaM3HkXvNrLeVfWaAqN04Ak_f-vLPDbeIhAsbX3JvZTdN8SRm-nypXR24kHllITA3TNfx73R3Bgu917QTCl554bO8OyA'
		,'PREF=ID=dd22a8aa2166d5e7:U=e67eb7783f27df89:FF=0:LD=en:NW=1:TM=1377477408:LM=1403063118:S=16F2ZQCF1jYirKva; GOOGLE_ABUSE_EXEMPTION=ID=d869b6d71438972a:TM=1403141300:C=c:IP=14.52.145.61-:S=APGng0uQLPcePr71sKL_EhxVU0dd-DWZQw; GoogleAccountsLocale_session=en; NID=67=j_yxTQLw_v5OjcC4m6UJrS5VoDmpz3JPBkb3B_pAmddqisOuFr5SJhMEZgrFOky15lpQaM3HkXvNrLeVfWaAqN04Ak_f-vLPDbeIhAsbX3JvZTdN8SRm-nypXR24kHllITA3TNfx73R3Bgu917QTCl554bO8OyA'
		,'PREF=ID=a40bbc1445233d6e:U=05c8bff55585e08a:FF=0:LD=en:TM=1377477748:LM=1403065578:GM=1:S=ioTqLmTCm1uR7Ljm; HSID=AGBvF2RepI4IyiaJI; SSID=As7eAnqnjvKVSMIH1; APISID=0xItbT7udS4rXPAJ/AM0rDKsf-xNzW1SMw; SAPISID=W0vxSYUUz-eOpLUH/AM4_9jkQRcgAIr2It; NID=67=SOj3Zng-D_WjHDWG2lCAcTYOxYix-XiL_sRqtHS4s3L3bI3Dssdwo3TQQ7MiuygOgLsCEkVdbE-3tFudyXMbcmeFgPkS9jxvB7t-YrsnNivWmRc-QUkk50mN2Zey-_q0_tvAl7OS3YSbUdormtctFaHD8EFjXFPsnhBvILfN7-kOtokaMqODov89XshIxqjz6eYixIg8ForS1eIrTAOLxgZ5YejB438uVzGvk3vzluzA; SID=DQAAANEAAACNgh12yttcvD7fSZ3R4bsAGo7qWH0-V-eRRsYOdrvMLLtAlLdctpRdnAaIziS4mBGVFv1Jl6GpQm1Pg-66OejEvQNQh0RzkGRi3kv1Sb5fjM7YCkHRXBOC9VscFWlcBu-hu8Zv8_baEDFfxLbe1HYsNHo8ZUhexrG9Ywh_zR0jHAt-LzPRmjwJD2hVMyjmBJC03HFJrCi0RChx89ucZTrY0fKPFUZYeO92r7WyAnz02Hj_GhIrvHtSb2QsQB9XC2IvK0iWo9Cukie8Gcq5zsokGSx4yWuPxEEoobsj1SzB7Q; OTZ=2347306_20_20__20'
		,'PREF=ID=a470dc5061868890:U=cfe1e0b55dc6d109:LD=en:TM=1380374055:LM=1398780039:GM=1:S=81j86rZ4UJ1P9N5X; OTZ=2336589_20_20__20_; GoogleAccountsLocale_session=en; NID=67=lbQLin64JXI_uH68LFLcb9ZwD7j6ZN6PlnrANtjXS_6zdAf5j5hJBzjOx95i6DDnFVnMnt8r09EPwSuRbHbFAci7Oj9bBIHrLaWgWVD1ZJKDkT7jMkurfPZTcXFtY-hrKOU56SlMo0odVFqHwD_356WXNk9dV7kqDIVL2il_stT7cC4DQ1k8HAN4-AeVyQlAKwypMSS5h9GUW83K30ciFjwlH7xOXyIslg; SID=DQAAANAAAADojQfRqB4OX_wZbUj7bI2S1SZnzpSu3aIPA6q07WSrJMaC5v_k91vVaD5dG38VnEOYYO05xvyx8YQD_ODUo0Ua7qIQr2IvHyDNe8P_3k0joU_vBxfbCE6SQHlYbyvGSV7hitkPA5ROv2f7x0hvXibQKhGI7_yQMcYu0N7R4J0x1yDO9FKv1k6Nb7-PevZgduWD4jyE1j7U6pA5nS1MN-0BsTPHVrlC5clhMDQsMfDv_YUByYzaXKCogocbc-57ygsO-xGpF9O_s4n8qbVbMkO5; HSID=A0vIg6zZx433Cn5ju; SSID=AH69qEwTzASKsBl5t; APISID=O9tKPKKeUfolwmdp/A_lmS6iEA4tMqvs6i; SAPISID=AzPOQkCIMks__B-r/A-9cLPTfNVsd1lpsA'
		,'PREF=ID=2e61a4e05023a929:U=a93ab5ad680a96ff:FF=0:LD=en:NW=1:TM=1380325366:LM=1395927581:S=vUuZD9ox7kozmsV4; GoogleAccountsLocale_session=en; NID=67=n8KG257X8AKu08bSCrsAxFgZ6pUVTm6jIabMESj3WFIXYqscPtKFM_8gRuOjp_Kntme4oenVZOADtynbYkpoBXYftXmoYKk51wW1Ueyf_bvZFMrais-fpP2ucNG-LtJx6wco4NCEuiAPKcuahQd0HB3tPg4a2Ew4RLJDnOPU4A5tGwlRnrrTT8sac-M85zPOXfqz1cStMsrB0fMu; SID=DQAAANEAAADojQfRqB4OX_wZbUj7bI2S1SZnzpSu3aIPA6q07WSrJMaC5v_k91vVaD5dG38VnEOYYO05xvyx8YQD_ODUo0Ua7qIQr2IvHyDNe8P_3k0joU_vBxfbCE6SQHlYbyvGSV7hitkPA5ROv2f7x0hvXibQKhGI7_yQMcYu0N7R4J0x1yDO9FKv1k6Nb7-PevZgduWD4jyE1j7U6pA5nS1MN-0BoLPssyYC73_BRUyloz0oHrd-_bN1fYUXKsYMTLkuGr11ONq-cwD2sA-0AsU7as7Nof3BLUIO-TjnXpf0K8HLYA; HSID=A_PPZoVOeTokfVrro; SSID=AdkDUolNLzyDUEJV7; APISID=O9tKPKKeUfolwmdp/A_lmS6iEA4tMqvs6i; SAPISID=AzPOQkCIMks__B-r/A-9cLPTfNVsd1lpsA'
	]	
	opener.addheaders = [
		 ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
		,('accept-encoding','gzip,deflate,sdch')
		,('accept-language','en-US,en;q=0.8,ko;q=0.6')
		,('Cache-Control','max-age=0')
		,('x-client-data','CN+1yQEIh7bJAQiitskBCKm2yQEIxLbJAQi4iMoBCPCIygEIqZTKAQ==')
		,('Cookie', cokis[randint(0,len(cokis)-1)])
		# ,('Cookie','__utma=1.1689297555.1392772617.1392772617.1392772617.1; __utmz=1.1392772617.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); adsenseReferralSourceId=YXNv; adsenseReferralSubId=d3ctd3ctZXQtSENMZWZ0TGluaw; adsenseReferralUrl=c3VwcG9ydC5nb29nbGUuY29tL2Fkc2Vuc2UvYW5zd2VyLzEyMDgzMjg; adsenseReferralUrlQuery=dG9waWM9MTE5MDQ2Ng; PREF=ID=a40bbc1445233d6e:U=05c8bff55585e08a:FF=0:LD=en:TM=1377477748:LM=1403065578:GM=1:S=ioTqLmTCm1uR7Ljm; HSID=AGBvF2RepI4IyiaJI; SSID=As7eAnqnjvKVSMIH1; APISID=0xItbT7udS4rXPAJ/AM0rDKsf-xNzW1SMw; SAPISID=W0vxSYUUz-eOpLUH/AM4_9jkQRcgAIr2It; SID=DQAAANEAAACNgh12yttcvD7fSZ3R4bsAGo7qWH0-V-eRRsYOdrvMLLtAlLdctpRdnAaIziS4mBGVFv1Jl6GpQm1Pg-66OejEvQNQh0RzkGRi3kv1Sb5fjM7YCkHRXBOC9VscFWlcBu-hu8Zv8_baEDFfxLbe1HYsNHo8ZUhexrG9Ywh_zR0jHAt-LzPRmjwJD2hVMyjmBJC03HFJrCi0RChx89ucZTrY0fKPFUZYeO92r7WyAnz02Hj_GhIrvHtSb2QsQB9XC2IvK0iWo9Cukie8Gcq5zsokGSx4yWuPxEEoobsj1SzB7Q; NID=67=SOj3Zng-D_WjHDWG2lCAcTYOxYix-XiL_sRqtHS4s3L3bI3Dssdwo3TQQ7MiuygOgLsCEkVdbE-3tFudyXMbcmeFgPkS9jxvB7t-YrsnNivWmRc-QUkk50mN2Zey-_q0_tvAl7OS3YSbUdormtctFaHD8EFjXFPsnhBvILfN7-kOtokaMqODov89XshIxqjz6eYixIg8ForS1eIrTAOLxgZ5YejB438uVzGvk3vzluzA; GOOGLE_ABUSE_EXEMPTION=ID=1373605dc5103e7a:TM=1403141519:C=c:IP=14.52.145.61-:S=APGng0sDpxoIW-x4UsDJnZqIF-jto2soWg')
		# ,('Cookie','__utma=1.1689297555.1392772617.1392772617.1392772617.1; __utmz=1.1392772617.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); adsenseReferralSourceId=YXNv; adsenseReferralSubId=d3ctd3ctZXQtSENMZWZ0TGluaw; adsenseReferralUrl=c3VwcG9ydC5nb29nbGUuY29tL2Fkc2Vuc2UvYW5zd2VyLzEyMDgzMjg; adsenseReferralUrlQuery=dG9waWM9MTE5MDQ2Ng; PREF=ID=a40bbc1445233d6e:U=05c8bff55585e08a:FF=0:LD=en:TM=1377477748:LM=1403065578:GM=1:S=ioTqLmTCm1uR7Ljm; HSID=AGBvF2RepI4IyiaJI; SSID=As7eAnqnjvKVSMIH1; APISID=0xItbT7udS4rXPAJ/AM0rDKsf-xNzW1SMw; SAPISID=W0vxSYUUz-eOpLUH/AM4_9jkQRcgAIr2It; SID=DQAAANEAAACNgh12yttcvD7fSZ3R4bsAGo7qWH0-V-eRRsYOdrvMLLtAlLdctpRdnAaIziS4mBGVFv1Jl6GpQm1Pg-66OejEvQNQh0RzkGRi3kv1Sb5fjM7YCkHRXBOC9VscFWlcBu-hu8Zv8_baEDFfxLbe1HYsNHo8ZUhexrG9Ywh_zR0jHAt-LzPRmjwJD2hVMyjmBJC03HFJrCi0RChx89ucZTrY0fKPFUZYeO92r7WyAnz02Hj_GhIrvHtSb2QsQB9XC2IvK0iWo9Cukie8Gcq5zsokGSx4yWuPxEEoobsj1SzB7Q; NID=67=SOj3Zng-D_WjHDWG2lCAcTYOxYix-XiL_sRqtHS4s3L3bI3Dssdwo3TQQ7MiuygOgLsCEkVdbE-3tFudyXMbcmeFgPkS9jxvB7t-YrsnNivWmRc-QUkk50mN2Zey-_q0_tvAl7OS3YSbUdormtctFaHD8EFjXFPsnhBvILfN7-kOtokaMqODov89XshIxqjz6eYixIg8ForS1eIrTAOLxgZ5YejB438uVzGvk3vzluzA')
		,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36')
	]
	google_res = opener.open(url)
	print google_res.info().get('Content-Encoding')
	if google_res.info().get('Content-Encoding') == 'gzip':
		buf = StringIO( google_res.read() )
		f = gzip.GzipFile(fileobj=buf)
		content = f.read()
		# print content
		# dataus = re.findall(r'<a class="en[a-zA-Z0-9\_\s]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
		dataus = re.search(r'<div id="resultStats">[\s\"]*About(\s)*[\d\,]*', content, re.M|re.I)
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


def initialBatch():
	print 'initialBatch begin'
	url = 'http://xcv1173.appspot.com/ewdfosid71'
	# url = 'http://localhost:8080/ewdfosid71'
	# result = urlfetch.fetch(url)
	result = urllib2.urlopen(url)
	lll = json.loads(result.read())

	# url = 'http://localhost:8080/tasks/durtka18handler'
	# result = urllib2.urlopen(url)
	for o in lll:
		# if int(o['rank']) <= 1040000 and int(o['rank']) > 12000 :
		url = 'http://xcv1173.appspot.com/tasks/durtka18handler?q=' + urllib.quote(o['name'].encode('utf-8'))
		# url = 'http://localhost:8080/tasks/durtka18handler?q=' + urllib.quote(o['name'].encode('utf-8'))
		print url
		result2 = urllib2.urlopen(url)
		print o['name'].encode('utf-8') + '-->' + result2.read()
	print 'Finished..'
		
def updateRankBatch():
	print 'updateRankBatch begin'
	url = 'http://xcv1173.appspot.com/ewdfosid71'
	# url = 'http://localhost:8080/ewdfosid71'
	result = urllib2.urlopen(url)
	lll = json.loads(result.read())
	for i, o in enumerate(lll):
		# if i > 2:
		# 	return
		rnk = gRankUrl(o['name'].encode('utf-8'))
		nm = o['name'].encode('utf-8')
		upurl = 'http://xcv1173.appspot.com/usoidsfjk12?nm='+urllib.quote(o['name'].encode('utf-8'))+'&rnk='+str(rnk)
		# upurl = 'http://localhost:8080/usoidsfjk12?nm='+urllib.quote(o['name'].encode('utf-8'))+'&rnk='+str(rnk)
		print upurl
		# http://xcv1173.appspot.com/usoidsfjk12?nm=%EC%99%95%EC%A2%8C%EC%9D%98%20%EA%B2%8C%EC%9E%84&rnk=1000000
		result2 = urllib2.urlopen(upurl)
		print o['name'].encode('utf-8') + '-->' + result2.read()
		time.sleep(randint(5,20))

	print 'Finished..'

def delAllMovieBatch():
	print 'delAllMovieBatch begin'
	url = 'http://xcv1173.appspot.com/ewdfosid71'
	# url = 'http://localhost:8080/ewdfosid71'
	result = urllib2.urlopen(url)
	lll = json.loads(result.read())
	for i, o in enumerate(lll):
		# if i > 2:
		# 	return
		# rnk = gRankUrl(o['name'].encode('utf-8'))
		nm = o['name'].encode('utf-8')
		# upurl = 'http://localhost:8080/ewdfosid67?q='+urllib.quote(nm)
		upurl = 'http://xcv1173.appspot.com/ewdfosid67?q='+urllib.quote(nm)
		result2 = urllib2.urlopen(upurl)
		print o['name'].encode('utf-8') + '-->' + result2.read()
		# time.sleep(randint(5,20))

	print 'Finished..'


def addmoviefromfile():
	# result = urlfetch.fetch(url)
	with open('mid.list2') as f:
		content = f.readlines()
		for c in content:
			print c.strip()
			# url = 'http://xcv1173.appspot.com/ewdfosid93?q=' + urllib.quote(c.strip())
			url = 'http://localhost:8080/ewdfosid93?q=' + urllib.quote(c.strip())
			result2 = urllib2.urlopen(url)

	# url = 'http://xcv1173.appspot.com/ewdfosid21'		
	url = 'http://localhost:8080/ewdfosid21'		
	result2 = urllib2.urlopen(url)
	print 'Finished...'

if __name__ == '__main__':
	# addmoviefromfile() 
	# updateRankBatch()
	# print gRankUrl("오펀 블랙")
	initialBatch()
	# delAllMovieBatch()

