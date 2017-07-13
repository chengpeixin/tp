window.onload = function () {
    var datas='';
    var tool = {
        GetQueryString: function (name) {
            //获取url参数
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null)return unescape(r[2]);
            return null;
        },
        formatDuring: function (mss) {
            //格式化时间戳
            var days = parseInt(mss / (1000 * 60 * 60 * 24));
            var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = (mss % (1000 * 60)) / 1000;
            return days + "天" + hours + "小时";
        }
    }


    //Code & IsOpenid
    function isUrlCode (){
        /*
        *
        * http://apply.haoyigong.com/vote2017/dovote.ashx?method=GetOpenid&CODE=xxx
        *
        * */
        var Code='0513kt6u0kqP5f1G0L8u0W3j6u03kt6p';
        if (Code){
            window.ajax.$ajax({
                url:'http://apply.haoyigong.com/vote2017/dovote.ashx?',
                data:{'method':'GetOpenid','CODE':Code},
                type:'post'
            },function(data){
                var result=data;
                if (result.code!=200)
                    alert(result.message);
                if (result.result.OPENID){
                    //openid存在则
                    GetOpenid(result.result.OPENID);
                }
            },function(err){
                alert('失败')
            },function(){})
        }
    }
    //init视图
    function informationInit(){

        /*
        *
        * http://apply.haoyigong.com/vote2017/dovote.ashx?method=Init&openid=xxx
        *
        * */
        $.get('http://apply.haoyigong.com/vote2017/dovote.ashx?',{
            'method':'Init',
            'openid':'123456'
        },function (data) {
            var data=JSON.parse(data),
                result=data.result;
            if (data.code!=200)
                alert(data.message);

            //是否关注公众号
            isFollw(result.isFollw);
            //倒计时
            CountDown(result.lastDay);
            //用户剩余票数
            SurplusUser(result.lastTp);
            //渲染被选举的人
            initElectionList(result.exection);
            //搜索功能
            datas=peopleAry(result.exection);
        })
    }
    //投票
    function userClkVote(openId,userId,dom) {
        /*
        *
        * http://apply.haoyigong.com/vote2017/dovote.ashx?method=Vote&openid=xxx&userid=xxx
        *
        * */
        window.ajax.$ajax({
            url:'http://apply.haoyigong.com/vote2017/dovote.ashx?',
            data:{
                'method':'Vote',
                'openid':openId,
                'userid':userId
            }
        },function (data) {
            var result=data.result;
            console.log(data)
            if (data.code!=200){
                alert(data.message);
            }
            if (result.lastTp==0)
                alert('您没有投票机会啦，请明天再来');
            return ;
            //更改票数
            RenderingDom(dom,result.total,result.lastTp);
            alert('投票成功')
        },function (err) {
            console.log(err)
        },function () {})
    }


    isUrlCode();
    informationInit();
    clkVote();


    //滚动加载
    // $(window).scroll(function () {
    //     // var footerHeight=$('footer').height
    //     var top = $(window).scrollTop() + $(window).height(),
    //         hgt = $(document).height();
    //     if (top >= hgt) {
    //         //假的，都是假的
    //         $('.load').css('display', 'flex')
    //         setTimeout(function () {
    //             for (var i = 0; i < 3; i++) {
    //                 var cloneNode = dom.cloneNode(true);
    //                 dom.parentNode.appendChild(cloneNode)
    //                 $('.load').css('display', 'none')
    //             }
    //         }, 1000)
    //     }
    // })

    //搜索
    $('#Search').on('touchend', function () {
        okZhaoDao();
        $('.peopleList').html('');
        var Search_val = $('#Search_text').val(),
            state=false;
        if(Search_val!=''){
            //查询
            $(datas).each(function (i,v) {
                if (Search_val==v.num||Search_val==v.name){
                    var dom="<div class='people'><div class='portrait'><img width='100%' height='100%'src='"+v.portrait+"' alt=''> <div class='peopleName'> <p class='pt'> <span class=''>1</span> <span class='name'>"+v.name+"</span> </p> <p class='name_content'>"+v.hospital+"</p> <div class='btn_toupiao' id='"+v.num+"'> <embed class ='tpsvg' src='./../svg/tp.svg' type='image/svg+xml'/> <span data-num='"+v.num+"'>投票</span> </div> <p class='zongpiaoshu'id='zongpiaoshu'>"+v.votes+"</p> </div> </div> </div> </div> </div>";
                    $('.peopleList').append(dom),
                        state=true;
                }
            })
        }else {
            informationInit();
        }


        if (!state){
            var dom='<div class="disNoe"><div> <div class="notZhaoDao"><embed src="./../svg/notZhaoDao.svg" type="image/svg+xml"/><span class="notZhaoDao_txt">没有找到您要找的人</span></div></div>';
            $('.peopleList').append(dom);
        }
    })
    //倒计时
    function CountDown(time) {
        var StarTime=''+Date.parse(new Date()),
            EndTilem=(time+'000')-StarTime;
        $('#time').html(tool.formatDuring(EndTilem))
    }
    //剩余票数
    function SurplusUser(data) {
        $('#piaoshu').html(data);
    }
    //是否关注公众号
    function isFollw(data){
        if (data){
            console.log('已经关注了')
            return ;
        }
    }
    //渲染被选举者列表
    function initElectionList(data) {
        okZhaoDao();
        $(data).each(function (i,v) {
            var dom="<div class='people'><div class='portrait'><img width='100%' height='100%'src='"+v.portrait+"' alt=''> <div class='peopleName'> <p class='pt'> <span class=''>1</span> <span class='name'>"+v.name+"</span> </p> <p class='name_content'>"+v.hospital+"</p> <div class='btn_toupiao' id='"+v.num+"'> <embed class ='tpsvg' src='./../svg/tp.svg' type='image/svg+xml'/> <span data-num='"+v.num+"'>投票</span> </div> <p class='zongpiaoshu'id='zongpiaoshu'>"+v.votes+"</p> </div> </div> </div> </div> </div>";
            $(dom).appendTo($('.peopleList'))
        })
    }
    //获取OPENID
    function GetOpenid(op) {
        return op;
    }
    //点击投票
    function clkVote() {
        $('.peopleList').on('touchend', '.btn_toupiao',function () {
            var openId=GetOpenid(),
                userId=$(this).attr('id');
                userClkVote(openId,userId,this);
        })
    }
    //点击投票后渲染剩余票数和总票数
    function RenderingDom(dom,total,lastTp) {
        var bDom=$(dom).next();
        $(bDom).html(total);
        $('#piaoshu').html(lastTp);
    }
    //返回搜索数据
    function peopleAry(people) {
        return people;
    }
    //搜索为空后重新渲染
    function okZhaoDao() {
        $('.peopleList').empty('.disNoe')
    }
}