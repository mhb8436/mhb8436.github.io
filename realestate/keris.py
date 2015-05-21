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

gugunCodeList = ['1111000000','1114000000','1117000000','1120000000','1121500000','1123000000','1126000000','1129000000','1130500000','1132000000','1135000000','1138000000','1141000000','1144000000','1147000000','1150000000','1153000000','1154500000','1156000000','1159000000','1162000000','1165000000','1168000000','1171000000','1174000000','2611000000','2614000000','2617000000','2620000000','2623000000','2626000000','2629000000','2632000000','2635000000','2638000000','2641000000','2644000000','2647000000','2650000000','2653000000','2671000000','2711000000','2714000000','2717000000','2720000000','2723000000','2726000000','2729000000','2771000000','2811000000','2814000000','2817000000','2818500000','2820000000','2823700000','2824500000','2826000000','2871000000','2872000000','2911000000','2914000000','2915500000','2917000000','2920000000','3011000000','3014000000','3017000000','3020000000','3023000000','3111000000','3114000000','3117000000','3120000000','3171000000','4111000000','4113000000','4115000000','4117000000','4119000000','4121000000','4122000000','4125000000','4127000000','4128000000','4129000000','4131000000','4136000000','4137000000','4139000000','4141000000','4143000000','4145000000','4146000000','4148000000','4150000000','4155000000','4157000000','4159000000','4161000000','4163000000','4165000000','4173000000','4180000000','4182000000','4183000000','4211000000','4213000000','4215000000','4217000000','4219000000','4221000000','4223000000','4272000000','4273000000','4275000000','4276000000','4277000000','4278000000','4279000000','4280000000','4281000000','4282000000','4283000000','4311000000','4313000000','4315000000','4372000000','4373000000','4374000000','4374500000','4375000000','4376000000','4377000000','4380000000','4413000000','4415000000','4418000000','4420000000','4421000000','4423000000','4425000000','4471000000','4473000000','4476000000','4477000000','4479000000','4480000000','4481000000','4482500000','4483000000','4511000000','4513000000','4514000000','4518000000','4519000000','4521000000','4571000000','4572000000','4573000000','4574000000','4575000000','4577000000','4579000000','4580000000','4611000000','4613000000','4615000000','4617000000','4623000000','4671000000','4672000000','4673000000','4677000000','4678000000','4679000000','4680000000','4681000000','4682000000','4683000000','4684000000','4686000000','4687000000','4688000000','4689000000','4690000000','4691000000','4711000000','4713000000','4715000000','4717000000','4719000000','4721000000','4723000000','4725000000','4728000000','4729000000','4772000000','4773000000','4775000000','4776000000','4777000000','4782000000','4783000000','4784000000','4785000000','4790000000','4792000000','4793000000','4794000000','4812000000','4817000000','4822000000','4824000000','4825000000','4827000000','4831000000','4833000000','4872000000','4873000000','4874000000','4882000000','4884000000','4885000000','4886000000','4887000000','4888000000','4889000000','5011000000','5013000000','3611025000','3611031000','3611032000','3611033000','3611034000','3611035000','3611036000','3611037000','3611038000','3611039000','3611010100','3611010200','3611010300','3611010400','3611010500','3611010600','3611010700','3611010800','3611010900','3611011000','3611011100','3611011200','3611011300','3611011400']
gugunNameList = ['종로구','중구','용산구','성동구','광진구','동대문구','중랑구','성북구','강북구','도봉구','노원구','은평구','서대문구','마포구','양천구','강서구','구로구','금천구','영등포구','동작구','관악구','서초구','강남구','송파구','강동구','중구','서구','동구','영도구','부산진구','동래구','남구','북구','해운대구','사하구','금정구','강서구','연제구','수영구','사상구','기장군','중구','동구','서구','남구','북구','수성구','달서구','달성군','중구','동구','남구','연수구','남동구','부평구','계양구','서구','강화군','옹진군','동구','서구','남구','북구','광산구','동구','중구','서구','유성구','대덕구','중구','남구','동구','북구','울주군','수원시','성남시','의정부시','안양시','부천시','광명시','평택시','동두천시','안산시','고양시','과천시','구리시','남양주시','오산시','시흥시','군포시','의왕시','하남시','용인시','파주시','이천시','안성시','김포시','화성시','광주시','양주시','포천시','여주군','연천군','가평군','양평군','춘천시','원주시','강릉시','동해시','태백시','속초시','삼척시','홍천군','횡성군','영월군','평창군','정선군','철원군','화천군','양구군','인제군','고성군','양양군','청주시','충주시','제천시','보은군','옥천군','영동군','증평군','진천군','괴산군','음성군','단양군','천안시','공주시','보령시','아산시','서산시','논산시','계룡시','금산군','연기군','부여군','서천군','청양군','홍성군','예산군','태안군','당진시','전주시','군산시','익산시','정읍시','남원시','김제시','완주군','진안군','무주군','장수군','임실군','순창군','고창군','부안군','목포시','여수시','순천시','나주시','광양시','담양군','곡성군','구례군','고흥군','보성군','화순군','장흥군','강진군','해남군','영암군','무안군','함평군','영광군','장성군','완도군','진도군','신안군','포항시','경주시','김천시','안동시','구미시','영주시','영천시','상주시','문경시','경산시','군위군','의성군','청송군','영양군','영덕군','청도군','고령군','성주군','칠곡군','예천군','봉화군','울진군','울릉군','창원시','진주시','통영시','사천시','김해시','밀양시','거제시','양산시','의령군','함안군','창녕군','고성군','남해군','하동군','산청군','함양군','거창군','합천군','제주시','서귀포시','조치원읍','연기면','연동면','부강면','금남면','장군면','연서면','전의면','전동면','소정면','반곡동','소담동','보람동','대평동','가람동','한솔동','나성동','새롬동','다정동','어진동','종촌동','고운동','아름동','도담동']
gugunFullNameList = ['서울특별시 종로구  ','서울특별시 중구  ','서울특별시 용산구  ','서울특별시 성동구  ','서울특별시 광진구  ','서울특별시 동대문구  ','서울특별시 중랑구  ','서울특별시 성북구  ','서울특별시 강북구  ','서울특별시 도봉구  ','서울특별시 노원구  ','서울특별시 은평구  ','서울특별시 서대문구  ','서울특별시 마포구  ','서울특별시 양천구  ','서울특별시 강서구  ','서울특별시 구로구  ','서울특별시 금천구  ','서울특별시 영등포구  ','서울특별시 동작구  ','서울특별시 관악구  ','서울특별시 서초구  ','서울특별시 강남구  ','서울특별시 송파구  ','서울특별시 강동구  ','부산광역시 중구  ','부산광역시 서구  ','부산광역시 동구  ','부산광역시 영도구  ','부산광역시 부산진구  ','부산광역시 동래구  ','부산광역시 남구  ','부산광역시 북구  ','부산광역시 해운대구  ','부산광역시 사하구  ','부산광역시 금정구  ','부산광역시 강서구  ','부산광역시 연제구  ','부산광역시 수영구  ','부산광역시 사상구  ','부산광역시 기장군  ','대구광역시 중구  ','대구광역시 동구  ','대구광역시 서구  ','대구광역시 남구  ','대구광역시 북구  ','대구광역시 수성구  ','대구광역시 달서구  ','대구광역시 달성군  ','인천광역시 중구  ','인천광역시 동구  ','인천광역시 남구  ','인천광역시 연수구  ','인천광역시 남동구  ','인천광역시 부평구  ','인천광역시 계양구  ','인천광역시 서구  ','인천광역시 강화군  ','인천광역시 옹진군  ','광주광역시 동구  ','광주광역시 서구  ','광주광역시 남구  ','광주광역시 북구  ','광주광역시 광산구  ','대전광역시 동구  ','대전광역시 중구  ','대전광역시 서구  ','대전광역시 유성구  ','대전광역시 대덕구  ','울산광역시 중구  ','울산광역시 남구  ','울산광역시 동구  ','울산광역시 북구  ','울산광역시 울주군  ','경기도 수원시  ','경기도 성남시  ','경기도 의정부시  ','경기도 안양시  ','경기도 부천시  ','경기도 광명시  ','경기도 평택시  ','경기도 동두천시  ','경기도 안산시  ','경기도 고양시  ','경기도 과천시  ','경기도 구리시  ','경기도 남양주시  ','경기도 오산시  ','경기도 시흥시  ','경기도 군포시  ','경기도 의왕시  ','경기도 하남시  ','경기도 용인시  ','경기도 파주시  ','경기도 이천시  ','경기도 안성시  ','경기도 김포시  ','경기도 화성시  ','경기도 광주시  ','경기도 양주시  ','경기도 포천시  ','경기도 여주군  ','경기도 연천군  ','경기도 가평군  ','경기도 양평군  ','강원도 춘천시  ','강원도 원주시  ','강원도 강릉시  ','강원도 동해시  ','강원도 태백시  ','강원도 속초시  ','강원도 삼척시  ','강원도 홍천군  ','강원도 횡성군  ','강원도 영월군  ','강원도 평창군  ','강원도 정선군  ','강원도 철원군  ','강원도 화천군  ','강원도 양구군  ','강원도 인제군  ','강원도 고성군  ','강원도 양양군  ','충청북도 청주시  ','충청북도 충주시  ','충청북도 제천시  ','충청북도 보은군  ','충청북도 옥천군  ','충청북도 영동군  ','충청북도 증평군  ','충청북도 진천군  ','충청북도 괴산군  ','충청북도 음성군  ','충청북도 단양군  ','충청남도 천안시  ','충청남도 공주시  ','충청남도 보령시  ','충청남도 아산시  ','충청남도 서산시  ','충청남도 논산시  ','충청남도 계룡시  ','충청남도 금산군  ','충청남도 연기군  ','충청남도 부여군  ','충청남도 서천군  ','충청남도 청양군  ','충청남도 홍성군  ','충청남도 예산군  ','충청남도 태안군  ','충청남도 당진시  ','전라북도 전주시  ','전라북도 군산시  ','전라북도 익산시  ','전라북도 정읍시  ','전라북도 남원시  ','전라북도 김제시  ','전라북도 완주군  ','전라북도 진안군  ','전라북도 무주군  ','전라북도 장수군  ','전라북도 임실군  ','전라북도 순창군  ','전라북도 고창군  ','전라북도 부안군  ','전라남도 목포시  ','전라남도 여수시  ','전라남도 순천시  ','전라남도 나주시  ','전라남도 광양시  ','전라남도 담양군  ','전라남도 곡성군  ','전라남도 구례군  ','전라남도 고흥군  ','전라남도 보성군  ','전라남도 화순군  ','전라남도 장흥군  ','전라남도 강진군  ','전라남도 해남군  ','전라남도 영암군  ','전라남도 무안군  ','전라남도 함평군  ','전라남도 영광군  ','전라남도 장성군  ','전라남도 완도군  ','전라남도 진도군  ','전라남도 신안군  ','경상북도 포항시  ','경상북도 경주시  ','경상북도 김천시  ','경상북도 안동시  ','경상북도 구미시  ','경상북도 영주시  ','경상북도 영천시  ','경상북도 상주시  ','경상북도 문경시  ','경상북도 경산시  ','경상북도 군위군  ','경상북도 의성군  ','경상북도 청송군  ','경상북도 영양군  ','경상북도 영덕군  ','경상북도 청도군  ','경상북도 고령군  ','경상북도 성주군  ','경상북도 칠곡군  ','경상북도 예천군  ','경상북도 봉화군  ','경상북도 울진군  ','경상북도 울릉군  ','경상남도 창원시  ','경상남도 진주시  ','경상남도 통영시  ','경상남도 사천시  ','경상남도 김해시  ','경상남도 밀양시  ','경상남도 거제시  ','경상남도 양산시  ','경상남도 의령군  ','경상남도 함안군  ','경상남도 창녕군  ','경상남도 고성군  ','경상남도 남해군  ','경상남도 하동군  ','경상남도 산청군  ','경상남도 함양군  ','경상남도 거창군  ','경상남도 합천군  ','제주특별자치도 제주시  ','제주특별자치도 서귀포시  ','세종특별자치시 조치원읍 ','세종특별자치시 연기면 ','세종특별자치시 연동면 ','세종특별자치시 부강면 ','세종특별자치시 금남면 ','세종특별자치시 장군면 ','세종특별자치시 연서면 ','세종특별자치시 전의면 ','세종특별자치시 전동면 ','세종특별자치시 소정면 ','세종특별자치시 반곡동 ','세종특별자치시 소담동 ','세종특별자치시 보람동 ','세종특별자치시 대평동 ','세종특별자치시 가람동 ','세종특별자치시 한솔동 ','세종특별자치시 나성동 ','세종특별자치시 새롬동 ','세종특별자치시 다정동 ','세종특별자치시 어진동 ','세종특별자치시 종촌동 ','세종특별자치시 고운동 ','세종특별자치시 아름동 ','세종특별자치시 도담동 ']

SRC_GUGUN_CODE = []
for i, v in enumerate(gugunCodeList):
	SRC_GUGUN_CODE.append({'code':v, 'name':gugunNameList[i], 'fullname':gugunFullNameList[i]})

GS_BURYU_CD = [{'code':'JG010', 'name':'학생 재학 현황'}
	,{'code':'JG020', 'name':'전·출입 및 학업중단 학생수'}
	,{'code':'JG030', 'name':'입학생 현황'}
	,{'code':'JG040', 'name':'졸업생 진로 및 장학금 수혜 현황'}
	,{'code':'JG310', 'name':'학생 체력 증진'}
	,{'code':'JG050', 'name':'직위별 교원 현황'}
	,{'code':'JG060', 'name':'자격종별 교원 현황'}
	,{'code':'JG320', 'name':'교원 성과상여금제도 운영 현황'}
	,{'code':'JG250', 'name':'교원단체 및 노조가입 현황'}
	,{'code':'JG090', 'name':'각종 규정'}
	,{'code':'JG100', 'name':'교육계획 및 편성·운영'}
	,{'code':'JG110', 'name':'평가기준 및 계획'}
	,{'code':'JG120', 'name':'학교운영위원회'}
	,{'code':'JG130', 'name':'동아리활동 및 방과후학교 등'}
	,{'code':'JG140', 'name':'학교시설 및 개방 현황'}
	,{'code':'JG150', 'name':'학교급식에 관한 사항'}
	,{'code':'JG160', 'name':'학교폭력대책 및 학생·학부모 상담실적'}
	,{'code':'JG170', 'name':'학교보건 및 환경위생 현황'}
	,{'code':'JG180', 'name':'학교도서관'}
	,{'code':'JG240', 'name':'행정직원 노동조합 가입 현황'}
	,{'code':'JG300', 'name':'학교 평가'}
	,{'code':'JG190', 'name':'학교회계 예·결산서'}
	,{'code':'JG200', 'name':'사립학교 예·결산서'}
	,{'code':'JG210', 'name':'학교발전기금'}
	,{'code':'JG290', 'name':'교복 구매 유형 및 단가'}
	,{'code':'JG220', 'name':'학년별 교과별 성적사항'}
	,{'code':'JG330', 'name':'국가수준 학업성취도 사항'}] 	
	
SRC_SIDO_CODE  = [
	{'code':'1100000000','name':'서울특별시'},
	{'code':'2600000000','name':'부산광역시'},
	{'code':'2700000000','name':'대구광역시'},
	{'code':'2800000000','name':'인천광역시'},
	{'code':'2900000000','name':'광주광역시'},
	{'code':'3000000000','name':'대전광역시'},
	{'code':'3100000000','name':'울산광역시'},
	{'code':'3600000000','name':'세종특별자치시'},
	{'code':'4100000000','name':'경기도'},
	{'code':'4200000000','name':'강원도'},
	{'code':'4300000000','name':'충청북도'},
	{'code':'4400000000','name':'충청남도'},
	{'code':'4500000000','name':'전라북도'},
	{'code':'4600000000','name':'전라남도'},
	{'code':'4700000000','name':'경상북도'},
	{'code':'4800000000','name':'경상남도'},
	{'code':'5000000000','name':'제주특별자치도'}]

def get_data_from_url(url):
	opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
	urllib2.install_opener(opener)
	opener.addheaders = [
		 ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
		,('accept-encoding','gzip,deflate,sdch')
		,('accept-language','ko-KR,ko;q=0.8,en-US;q=0.6,en;q=0.4')
		,('Cache-Control','no-cache')
		,('Connection','keep-alive')
		,('Cookie','JSESSIONID=xFrwKvBGb4FjrFl0wNHH9qLpcA1bMGgqyhafPXqSqSOqFf9261Gsi1mw1qmkfhki.mest-slwas2_servlet_engine3; zoomVal=100')
		,('Host','www.schoolinfo.go.kr')
		,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36')
	]
	try:
		res = opener.open(url)
		# print res.read()
		print res.info().get('Content-Encoding')
		if res.info().get('Content-Encoding') == 'gzip':
			buf = StringIO( res.read() )
			f = gzip.GzipFile(fileobj=buf)
			data = f.readlines()
			return data
		else:
			return res.read()
	except Exception as e:
		print e

def acquire_school_info(url, values):
	opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
	urllib2.install_opener(opener)
	opener.addheaders = [
		 ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
		,('accept-encoding','gzip,deflate')
		,('accept-language','ko-KR,ko;q=0.8,en-US;q=0.6,en;q=0.4')
		,('Cache-Control','no-cache')
		,('Connection','keep-alive')
		,('Content-Length','211')
		,('Content-Type','application/x-www-form-urlencoded')
		,('Cookie','JSESSIONID=xFrwKvBGb4FjrFl0wNHH9qLpcA1bMGgqyhafPXqSqSOqFf9261Gsi1mw1qmkfhki.mest-slwas2_servlet_engine3; zoomVal=100')
		,('Host','www.schoolinfo.go.kr')
		,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36')
		,('Referer',url)
	]
	try:
		res = opener.open(urllib2.Request(url, urllib.urlencode(values)))
		# print res.read()
		# print res.info().get('Content-Encoding')
		if res.info().get('Content-Encoding') == 'gzip':
			buf = StringIO( res.read() )
			f = gzip.GzipFile(fileobj=buf)
			data = f.readlines()
			return data
		else:
			return res.read()
	except Exception as e:
		print e

def schoollist():
	surl = 'http://www.schoolinfo.go.kr/ei/ss/Pneiss_a01_l0.do?SEARCH_KIND=BURYU&HG_JONGRYU_GB=02&SRC_SIDO_CODE='+SRC_SIDO_CODE[0]['code']+'&SRC_GUGUN_CODE='+SRC_GUGUN_CODE[4]['code']+'&SRC_HG_NM=&GS_BURYU_CD='+GS_BURYU_CD[0]['code']
	print surl
	data=get_data_from_url(surl)
	for line in data.split('\n'):
		if 'parent.goSchool' in line:
			line = line.decode('euc-kr').encode('utf-8')
			code = re.search(r'(?<=parent.goSchool\(\')[\d\w]+', line, re.M|re.I)
			name = re.search(r'(?<=window.status\=\(\')(.)*(?=\'\);return true" onmouseout)', line, re.M|re.I)
			address = re.search(r'(?<=title\=\")[\d\s[가-힣]*]*', line, re.M|re.I)
			print code.group() + ':' + name.group() + ':' + address.group()
			# (?<=parent.goSchool\(')[\d\w]+  # code
			# (?<=title\=\")[\d\s[가-힣]*]*    # address
			# (?<=window.status\=\(')(.)*(?='\);return true" onmouseout)

if __name__ == '__main__':
	# url = "http://www.youtube.com/watch?v=nvyfnpCs5-k&list=PLxAqlO4zbr3Ncq0AGbMC2k8osRydFMOtf"
	# data=get_data_from_url(url)
	# schoollist()
	# '?HG_CD=B100000983&HG_NM=&GS_BURYU_CD=JG330&GS_HANGMOK_CD=63&JG_BURYU_CD=JG120&JG_HANGMOK_CD=48&JG_GUBUN=1&GS_HANGMOK_NO=12
	# &GS_HANGMOK_NM=&JG_YEAR=2014&JG_CHASU=5&adminYN=N&isCaptcha=N&JG_INVE_TME=1&passline=p8n6b'
	values = {
		'HG_CD':'B100000983'
		,'HG_NM':''
		,'GS_BURYU_CD':'JG330'
		,'GS_HANGMOK_CD':'63'
		,'JG_BURYU_CD':'JG120'
		,'JG_HANGMOK_CD':'48'
		,'JG_GUBUN':'1'
		,'GS_HANGMOK_NO':'12'
		,'GS_HANGMOK_NM':''
		,'JG_YEAR':'2014'
		,'JG_CHASU':'5'
		,'adminYN':'N'
		,'isCaptcha':'Y'
		,'JG_INVE_TME':'1'
		,'passline':'p8n6b'
	}
	data = acquire_school_info('http://www.schoolinfo.go.kr/ei/pp/Pneipp_b63_s0p.do', values)

	print data.decode('euc-kr').encode('utf-8')



