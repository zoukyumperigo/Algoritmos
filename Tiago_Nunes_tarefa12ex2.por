programa {
  funcao inicio() {

    inteiro soma,produto,quadradodasoma,num1,num2,count,opcao   
    real media 


    opcao = 1
    soma = 0
    produto = 1
    count =  0
    quadradodasoma=0

   
    
    enquanto (opcao>0){
    escreva("---------------MENU---------------\n1-Inserir dois n�meros para calcular a sua soma \n2-Inserir dois n�meros para calcular o seu respectivo produto \n3-Insere dez n�meros para calcular a sua m�dia\n4-Insere quatro n�meros e o quadrado da sua soma\n0-Sair\n---------------------------------------\n*Insere apenas n�meros maiores que 0 e menores que 20\n")
    leia(opcao)

    
    escolha(opcao){
      caso 1:
      {
    
      escreva("1� n�mero: ")
      leia(num1)
      escreva("2� n�mero: ")
      leia(num2)
      

      enquanto((num1<0 ou num1>20) e (num2<0 ou num2>20))
      { 
      escreva("1� n�mero: ")
      leia(num1)
      escreva("2� n�mero: ")
      leia(num2)
      }

      soma=num1+num2
      escreva("Soma: ",soma,"\n\n")
      escreva("------------------------------------------------------\n")
      soma = 0
      pare
      }

      caso 2:
      {

      
      
      escreva("1� n�mero: ")
      leia(num1)
      escreva("2� n�mero: ")
      leia(num2)

      enquanto((num1<0 e num1 >20) e (num2<0 e num2>20)){ 
      escreva("1� n�mero: ")
      leia(num1)
      escreva("2� n�mero: ")
      leia(num2)}
      produto*=num1*num2
      escreva("Produto: ",produto,"\n\n")
      escreva("------------------------------------------------------\n")
      produto = 1
      pare
      }

      caso 3:
      
      inteiro i = 0
      escreva("Insira n�mero ",i+1,": \n")
      leia(num1)
      soma+=num1
           
                   
      

      para(i = 1;i<10;i++){ 
      escreva("Insira n�mero ",i+1,": \n")
      leia(num1)
      soma+=num1
      
      
        
            
      }

  
      media=num1/(count+1)
      count=0
      soma=0
      escreva("M�dia dos 10 n�meros: ",media,"\n\n")
      escreva("------------------------------------------------------\n")
      pare

      caso 4:
      
      num1=-1
      enquanto(num1<0 ou num1>20)
      {
      escreva("Insira n�mero 1 : \n")
      leia(num1)
      }
      
      quadradodasoma+=num1
      

      
      para(inteiro a = 1;a<4;a++)
      {
      
      escreva("Insira n�mero ",a+1,"\n")
      leia(num1)
      quadradodasoma+=num1
      
      }

      escreva("Quadrado da soma: ",quadradodasoma*quadradodasoma,"\n")
      escreva("------------------------------------------------------\n")
      num1=0
      quadradodasoma=0
      pare
      


      }




    


      





    





    }

  


    
    
    }
    }
