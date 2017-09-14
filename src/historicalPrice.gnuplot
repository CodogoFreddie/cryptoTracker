set terminal png size 400,200 enhanced font "Helvetica,10"
set output 'btc-usd.png'

set xdata time
set timefmt "%s"
set format x "%d/%m"
set xtics 1000000
set autoscale xfix

a(x) = 2000
b(x) = 3000
c(x) = 4000

plot \
	a(x) notitle linewidth 2, \
	b(x) notitle linewidth 2, \
	c(x) notitle linewidth 2, \
	'/tmp/btc-usd.dat' u 1:2 smooth sbezier notitle linewidth 2
