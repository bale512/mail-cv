/**
 * 业务相关的JS处理代码
*/
sampleCount = 0;
sampleCurrentIndex = 1;
boxId = 1;
boxListOfSample = {}; //一张样本图片的标注集合(box_id为key)
$(function(){
    $('#total').text(sampleCount);
    loadSamplePic(sampleCurrentIndex);
    $('#side_left').click(function(){
        $('#btn_save').click();
        sampleCurrentIndex -= 1;
        if(sampleCurrentIndex<=0){
            sampleCurrentIndex = sampleCount;
        }
        loadSamplePic(sampleCurrentIndex);
    });
    $('#side_right').click(function(){
        $('#btn_save').click();
        sampleCurrentIndex += 1;
        if(sampleCurrentIndex>sampleCount){
            sampleCurrentIndex = 1;
        }
        loadSamplePic(sampleCurrentIndex);
    });
    $(document).keyup(function(event){
      if (event.keyCode === 37){//left
        $('#side_left').click();
      }else if(event.keyCode === 39){//right
        $('#side_right').click();
      }
    });
    $('#jump_page').keypress(function(e){
        if(e.keyCode==13){
            let indexStr = $(this).val();
            index = parseInt(indexStr);
            if(index<=0 || indexStr==''){
                index = sampleCurrentIndex;
            }else if(index>sampleCount){
                index = sampleCount;
            }
            sampleCurrentIndex = index;
            loadSamplePic(index);
        }
    });
    $('#btn_save').click(function(){
        if (JSON.stringify(boxListOfSample) == '{}'){
            layer.msg('请先进行标注');
            return;
        }
        tagStrTotal = '';
        for(key in boxListOfSample){
            tagStrTotal+=boxListOfSample[key]+'\n';
        }
        saveRegionInfo(tagStrTotal);
        $('#cur_loc').html('');
        updateTotalTagStatus();
        boxId = 1;
        boxListOfSample = {};
    });
    get_labels();
    $('#radio-type').click(function(){
        $(document).focus();
    });
});

function get_labels(){
    $.ajax({
		type : "GET",
		dataType : "json",
		url : "/api/annotation/labels?"+new Date(),
		beforeSend:function(){
		},
		success : function(result){
		    if(result.message=='success'){
		        let html = '标注类型：';
		        index = 0;
		        for (let i in result.data){
		            let id = 'region_'+result.data[i].name;
		            let value = result.data[i].name;
		            let text = result.data[i].desc;
		            if(index==0){
		                html += '<label class="radio-inline"><input type="radio" name="radio_region" checked="checked" id="'+id+'" value="'+value+'">';
		            }else{
		                html += '<label class="radio-inline"><input type="radio" name="radio_region" id="'+id+'" value="'+value+'">';
		            }
		            html += ' '+text+'</label>';
		            index++;
		        }
                $('#radio-type').html(html);
		    }
		},
		error: function(){
		}
	});
}

function get_sample_label(index) {
    picNumberStr = PrefixInteger(index,6);
     $.ajax({
		type : "GET",
		dataType : "json",
		url : "/api/annotation/sampleLabel?index="+picNumberStr+'&time='+new Date(),
		beforeSend:function(){
		},
		success : function(result){
		    if (result.code === '500'){
                layer.msg(result.message)
                return
            }
            result.map(item => {
                img = document.getElementById("img");
                let active_box = document.createElement("div");
                // active_box.id = "active_box";
                active_box.setAttribute("box_id",'box_'+boxId); // 设置
                boxId++;
                active_box.className = "box";
                active_box.style.position = 'absolute';
                const top = parseInt(item.ymin) + img.offsetTop;
                const left = parseInt(item.xmin) + img.offsetLeft;
                active_box.style.top = top + 'px';
                active_box.style.left = left +'px';
                active_box.style.width = item.xmax - item.xmin +'px';
                active_box.style.height = item.ymax - item.ymin + 'px';
                active_box.innerText = item.name;
                document.body.appendChild(active_box);
                active_box = null;
            })
		},
		error: function(e){
		    layer.msg('没找到该图片对应的标注');
		}
	});
}
function loadSamplePic(index){
    get_sample_label(index)
    picNumberStr = PrefixInteger(index,6);
    url = "/api/annotation/sample?index="+picNumberStr+'&time='+new Date();
    $('#img').css({"background":"url('"+url+"') no-repeat left top"});
    $('#cur_id').html(picNumberStr);
    $('.box').remove();
    $('#cur_loc').html('');
}

function saveRegionInfo(tagResult){
    $.ajax({
		type : "POST",
		dataType : "json",
		url : "/api/annotation/save?"+new Date(),
		data : {'tags':tagResult},
		beforeSend:function(){
		},
		success : function(result){
		    layer.msg(result.message);
		},
		error: function(){
		}
	});
}

function isPassword(str) {
	let reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,15}/;
	return reg.test(str);
}

//时间戳转换成八位日期
function format2Date(uData){
	let myDate = new Date(uData);
	let year = myDate.getFullYear();
	let month = myDate.getMonth() + 1;
	let day = myDate.getDate();
	return year + '-' + month + '-' + day;
}

//时间戳转换成时间字符串
function format2Time(uData){
	let myDate = new Date(uData);
	let year = myDate.getFullYear();
	let month = myDate.getMonth() + 1;
	let day = myDate.getDate();
	let hour = myDate.getHours();
	let minute = myDate.getMinutes();
	let second = myDate.getSeconds();
	return year + '-' + month + '-' + day+' '+hour+':'+minute+':'+second;
}

function PrefixInteger(num, length) {
 return (Array(length).join('0') + num).slice(-length);
}