import csv
import sys
import re
import urllib
import urllib2
# import simplejson as json
import json
import gzip
from StringIO import StringIO

def main():
	opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
	urllib2.install_opener(opener)
	opener.addheaders = [
		 ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
		,('accept-encoding','gzip,deflate,sdch')
		,('accept-language','en-US,en;q=0.8,ko;q=0.6')
		,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36')
	]

	google_res_url = """https://www.google.co.kr/search?newwindow=1&sclient=psy-ab&q=%EC%97%AD%EC%82%BC%EB%8F%99+%EB%A7%9B%EC%A7%91&oq=%EC%97%AD%EC%82%BC%EB%8F%99+%EB%A7%9B%EC%A7%91&gs_l=hp.3..35i39l2j0i5i30l2.203768.206002.18.206309.16.16.0.0.0.8.215.2853.0j12j4.16.0....0...1c.1j4.37.psy-ab..41.124.18177.18dIgU7m6MM&pbx=1&bav=on.2,or.r_cp.r_qf.&bvm=bv.62578216%2Cd.aGc%2Cpv.xjs.s.en_US.Qb9R7Hul644.O&fp=fa3f9b48e84c6c&biw=1132&bih=606&tch=1&ech=1&psi=la4dU9C_A4mSiAeLvoGQBw.1394453883695.31"""
	google_res = opener.open(google_res_url)

	print google_res.info().get('Content-Encoding')
	if google_res.info().get('Content-Encoding') == 'gzip':
		buf = StringIO( google_res.read() )
		f = gzip.GzipFile(fileobj=buf)
		data = f.read()
		data = data.replace('\\\\', '\\')
		data = data.decode('string_escape')
		data = data.replace('\\/','/')
		urls = re.findall(r'amp;u=http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+' , data)
		urls = [ url.replace('amp;u=','') for url in urls]
		urls = [ url.replace('&amp;','?') for url in urls]
		print '\n'.join(urls)

if __name__ == '__main__':
	main()