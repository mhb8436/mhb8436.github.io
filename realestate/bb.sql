select a.state, a.mainno, a.subno, a.apt from (
select distinct e.state||' '||e.mainno||' '||e.subno||' '||e.apt, e.state, e.mainno, e.subno, e.apt, 0, 0  
from real_estate e left join real_estate_addr a on e.state=a.state and e.mainno=a.mainno and e.subno=a.subno and a.apt=e.apt 
where a.lat is null ) a
