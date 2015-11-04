#README.md

1. 평당 가격
select state||' '||mainno||' '||subno||' '||apt as ttt, sum(tamount)/sum(area/3.3) as price
from real_estate_apt_buy 
where cym between '20140101' and '20140901'
group by state||' '||mainno||' '||subno||' '||apt
order by price desc; 

2. 거래량(기울기)

select a.ttt, regr_slope(COALESCE(b.cnt,0), extract(EPOCH from a.ymd::date))*10^7 as slope  from
(select  ttt, state, mainno, subno, apt, ymd
from copy_ymd d left join (select distinct state||' '||mainno||' '||subno||' '||apt as ttt, state, mainno,subno,apt  from real_estate_apt_buy ) o on o.state like '%서울특별시 양천구 목동%'
where d.ymd between '20140101' and '20140901') a
left join (
select state||' '||mainno||' '||subno||' '||apt as ttt, cym||'01' as ymd, count(1) as cnt 
from real_estate_apt_buy where cym between '20140101' and '20140901'
and state like '%서울특별시 양천구 목동%'
group by state||' '||mainno||' '||subno||' '||apt, cym order by 1,2
) b on a.ttt=b.ttt and a.ymd = b.ymd 
group by a.ttt order by slope desc

select a.ttt, a.ymd, coalesce(b.cnt,0) as cnt from 
(select  ttt, state, mainno, subno, apt, ymd
from copy_ymd d left join (select distinct state||' '||mainno||' '||subno||' '||apt as ttt, state, mainno,subno,apt  from real_estate_apt_buy ) o on o.apt like '%목동보미리즌빌%'
where d.ymd between '20140101' and '20140901') a
left join (
select state||' '||mainno||' '||subno||' '||apt as ttt, cym||'01' as ymd, count(1) as cnt 
from real_estate_apt_buy where cym between '20140101' and '20140901'
and apt like '%목동보미리즌빌%'
group by state||' '||mainno||' '||subno||' '||apt, cym order by 1,2
) b on a.ttt=b.ttt and a.ymd = b.ymd 


3. 거래량(년별, 기간별) - top 100 등 지역별 
select row_to_json(t) from (
select x.aptnm, x.ymd, a.lat, a.lng, x.cnt from (
select b.state||' '||b.mainno||' '||b.subno||' '||b.apt as aptnm, b.cym as ymd, min(b.state) as state, min(b.mainno) as mainno, min(b.subno) as subno, min(apt) as apt, count(1) as cnt 
from real_estate_apt_buy b 
where b.cym between '20130101' and '20141201'
and b.state like '%서울특별시 양천구%'
group by b.state||' '||b.mainno||' '||b.subno||' '||b.apt, b.cym
) x left join (select distinct state||' '||mainno||' '||subno||' '||apt, state, mainno,subno,apt,lat,lng from real_estate_addr) a on x.state=a.state and x.mainno=a.mainno and x.subno=a.subno and x.apt=a.apt order by x.ymd, x.cnt desc
) t 
;
and b.apt like '%디아이빌101동(331-101)%'
and b.state like '%서울특별시 양천구%'

4. copy_ymd 
select '20140101'::date + interval '1 month';

create table copy_ymd as
select to_char('20010101'::date + interval '1 month'*rn,'YYYYMMDD') as ymd from (
select row_number() over() as rn from real_estate_apt_buy limit 1000
) a;

select '20140101'::date + interval '1 month' * rn from ( select  row_number() over() as rn
from real_estate_apt_buy limit 10 ) a ;








