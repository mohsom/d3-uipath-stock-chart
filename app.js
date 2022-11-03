d3.csv('https://www.marketwatch.com/investing/stock/path/downloaddatapartial?startdate=01/03/2022 00:00:00&enddate=11/02/2022 23:59:59&daterange=d30&frequency=p1d&csvdownload=true&downloadpartial=false&newdates=false').then((data) => {
    console.log('data ->', data);
});