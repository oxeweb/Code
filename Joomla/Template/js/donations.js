/**
 * Modify the donation form based on the payment type selection
 */
$(document).ready(function(){
	var e = 'ligminchapaulista' + '@' + 'gmail.com'; // avoid cloaking
	var d = $('#donation');
	var a = $('#amount', d);
	$('#donation input[type=submit]').prop('disabled', true);
	$('#donation .paytype').removeAttr('checked').change(function(){
		var p = $(this).val();

		// Bank deposit
		if(p==1) {
			d.attr('action','/index.php?option=com_content&view=article&id=110');
		}

		// Paypal
		if(p==2) {
			d.attr('action','https://www.paypal.com/cgi-bin/webscr');
			$('input[type=hidden]', d).remove();
			a.attr('name', 'amount');
			d.append( '<input type="hidden" name="cmd" value="_xclick">' );
			d.append( '<input type="hidden" name="business" value="' + e + '" />' );
			d.append( '<input type="hidden" name="item_name" value="Doação para Ligmincha Brasil" />' );
			d.append( '<input type="hidden" name="currency_code" value="BRL" />' );
		}

		// PagSeguro
		if(p==3) {
			d.attr('action','/components/com_jshopping/payments/pm_pagseguro/donations.php?q=' + a.val().replace(',','.'));
		}

		// Enable the submit button
		$('#donation input[type=submit]').prop('disabled', false);
	});
	$('#donation').submit(function(){
		a.val(a.val().replace(',','.'));
	});
});
