<?php
/**@var $params array */
?>
<li class=" <?=$params['active']?>">
    <a href=" <?=$params['route']?>" class="lnk">
        <span class="label"> <?=urldecode($params['label'])?> </span>
        <i class="fas  <?=$params['icon']?>"></i>
    </a>
</li>