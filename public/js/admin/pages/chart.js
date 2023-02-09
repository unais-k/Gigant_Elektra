$(document).ready(function () {
    "use strict";

    axios({
        url: "/admin/dashboardgraph",
        method: "get",
    }).then((res) => {
        console.log(res.data.dailyprofits);
        if (res.data.status) {
            var options = {
                chart: {
                    height: 350,
                    type: "area",
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    curve: "smooth",
                },
                series: [
                    {
                        name: "Sales",
                        // data: [700, 400, 28, 1051, 2000],
                        data: res.data.dailysales,
                    },
                    {
                        name: "Profit",
                        // data: [11, 32, 45, 32, 34, 52, 41],
                        data: res.data.dailyprofits,
                    },
                ],
                xaxis: {
                    type: "datetime",
                    categories: res.data.datetata,
                },
                tooltip: {
                    x: {
                        format: "dd/MM/yy HH:mm",
                    },
                },
            };
            var chart = new ApexCharts(document.querySelector("#apexchart1"), options);
            chart.render();
        }
    });
    // apexchart1

    // apexchart2
    var options = {
        series: [15],
        chart: {
            height: 200,
            type: "radialBar",
            toolbar: {
                show: true,
            },
        },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 225,
                hollow: {
                    margin: 0,
                    size: "70%",
                    background: "#fff",
                    image: undefined,
                    position: "front",
                    dropShadow: {
                        enabled: true,
                        top: 3,
                        left: 0,
                        blur: 4,
                        opacity: 0.24,
                    },
                },
                track: {
                    background: "#fff",
                    strokeWidth: "67%",
                    margin: 0, // margin is in pixels
                    dropShadow: {
                        enabled: true,
                        top: -3,
                        left: 0,
                        blur: 4,
                        opacity: 0.35,
                    },
                },

                dataLabels: {
                    show: true,
                    name: {
                        offsetY: -10,
                        show: true,
                        color: "#888",
                        fontSize: "17px",
                    },
                    value: {
                        formatter: function (val) {
                            return parseInt(val.toString(), 10).toString();
                        },
                        color: "#111",
                        fontSize: "36px",
                        show: true,
                    },
                },
            },
        },
        fill: {
            type: "gradient",
            gradient: {
                shade: "dark",
                type: "horizontal",
                shadeIntensity: 0.5,
                gradientToColors: ["#ABE5A1"],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100],
            },
        },
        stroke: {
            lineCap: "round",
        },
        labels: ["Percent"],
    };

    var chart = new ApexCharts(document.querySelector("#apexchart2"), options);
    chart.render();

    axios({
        method: "get",
        url: "/admin/weekly",
    }).then((res) => {
        const month = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        const count = [];
        res.data.salesRep.forEach((element) => {
            count.push(element.count);
        });
        console.log(count);
        if (res.data.status) {
            var options = {
                series: [
                    {
                        name: "Series 1",
                        // data: [80, 50, 30, 40, 100, 20],
                        data: count,
                    },
                ],
                chart: {
                    height: 350,
                    type: "radar",
                },
                title: {
                    text: "Basic Radar Chart",
                },
                xaxis: {
                    // categories: [
                    //     "January",
                    //     // "February",
                    //     "March",
                    //     // "April",
                    //     "May",
                    //     // "June",
                    //     "July",
                    //     // "August",
                    //     "September",
                    //     // "October",
                    //     "November",
                    //     // "December",
                    // ],
                    categories: month,
                },
            };

            var chart = new ApexCharts(document.querySelector("#apexchart3"), options);
            chart.render();
        }
    });
    // apexchart3
});
